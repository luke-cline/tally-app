import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useOptimisticTransaction(workspaceId, onOptimistic) {
  const [saving, setSaving] = useState(false)

  const add = useCallback(async (txn) => {
    setSaving(true)
    const tempId = `temp_${Date.now()}`
    const optimistic = { ...txn, id: tempId, workspace_id: workspaceId, added_by: txn.added_by }
    onOptimistic({ type: "add", item: optimistic })

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        amount: txn.amount,
        category_id: txn.category_id,
        type: txn.type,
        date: txn.date,
        note: txn.note || "",
        added_by: txn.added_by,
        workspace_id: workspaceId
      })
      .select()
      .single()

    setSaving(false)
    if (error) {
      onOptimistic({ type: "undo_add", tempId })
      throw error
    }
    onOptimistic({ type: "confirm_add", tempId, real: data })
    return data
  }, [workspaceId, onOptimistic])

  const update = useCallback(async (id, changes) => {
    setSaving(true)
    const previous = changes.previous
    delete changes.previous
    onOptimistic({ type: "update", id, changes: { ...changes, previous } })

    const { error } = await supabase
      .from("transactions")
      .update(changes)
      .eq("id", id)

    setSaving(false)
    if (error) {
      onOptimistic({ type: "undo_update", id, previous })
      throw error
    }
    onOptimistic({ type: "clear_undo", id })
  }, [onOptimistic])

  const remove = useCallback(async (id) => {
    setSaving(true)
    onOptimistic({ type: "remove", id })

    const { error } = await supabase
      .from("transactions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)

    setSaving(false)
    if (error) {
      onOptimistic({ type: "undo_remove", id })
      throw error
    }
  }, [onOptimistic])

  return { saving, add, update, remove }
}