import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import CategoryIcon from "@/components/CategoryIcon"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/format"

export default function Categories() {
  const { workspaceId } = useWorkspace()
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
  if (!workspaceId) { setLoading(false); return }
    Promise.all([
      supabase.from("categories").select("*").eq("workspace_id", workspaceId).order("sort_order"),
      supabase.from("transactions").select("*").eq("workspace_id", workspaceId)
    ]).then(([catRes, txRes]) => {
      setCategories(catRes.data || [])
      setTransactions(txRes.data || [])
      setLoading(false)
    })
  }, [workspaceId])

  const now = new Date()
  const monthTxns = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const spentByCategory = {}
  monthTxns.filter(t => t.type === "expense").forEach(t => {
    spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + Number(t.amount)
  })

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditValue(cat.monthly_budget?.toString() || "")
  }

  const saveEdit = async (catId) => {
    const val = parseFloat(editValue) || 0
    await supabase.from("categories").update({ monthly_budget: val }).eq("id", catId)
    setCategories(cats => cats.map(c => c.id === catId ? { ...c, monthly_budget: val } : c))
    setEditingId(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories & Budgets</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap an amount to set a monthly spending limit.</p>
      </div>

      <div className="space-y-2">
        {categories.map(cat => {
          const spent = spentByCategory[cat.id] || 0
          const isEditing = editingId === cat.id
          return (
            <div key={cat.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CategoryIcon name={cat.name} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat.type === "income" ? "Income source" : `Spent ${formatCurrency(spent)} this month`}
                </p>
              </div>
              {cat.type === "expense" && (
                isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(cat.id)} onKeyDown={e => e.key === "Enter" && saveEdit(cat.id)}
                      className="w-24 h-8" autoFocus />
                  </div>
                ) : (
                  <button onClick={() => startEdit(cat)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                    {formatCurrency(cat.monthly_budget || 0)}
                  </button>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}