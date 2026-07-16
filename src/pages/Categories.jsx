import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useAuth } from "@/context/AuthContext"
import CategoryIcon from "@/components/CategoryIcon"
import IconPicker from "@/components/IconPicker"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X, Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/format"

export default function Categories() {
  const { workspaceId } = useWorkspace()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editBudget, setEditBudget] = useState("")
  const [editName, setEditName] = useState("")
  const [editIcon, setEditIcon] = useState("")
  const [saveError, setSaveError] = useState("")

  const loadData = () => {
    if (!workspaceId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      supabase.from("categories").select("*").eq("workspace_id", workspaceId).is("deleted_at", null).order("sort_order"),
      supabase.from("transactions").select("*").eq("workspace_id", workspaceId).is("deleted_at", null)
    ]).then(([catRes, txRes]) => {
      setCategories(catRes.data || [])
      setTransactions(txRes.data || [])
      setLoading(false)
    })
  }

  useEffect(loadData, [workspaceId])

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
    setEditBudget(cat.monthly_budget?.toString() || "0")
    setEditName(cat.name)
    setEditIcon(cat.icon || "MoreHorizontal")
    setSaveError("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setSaveError("")
  }

  const saveEdit = async (catId) => {
    const val = parseFloat(editBudget)
    if (isNaN(val) || val < 0) {
      setSaveError("Enter a valid amount")
      return
    }
    if (!editName.trim()) {
      setSaveError("Name can't be empty")
      return
    }
    const { error } = await supabase
      .from("categories")
      .update({ monthly_budget: val, name: editName.trim(), icon: editIcon })
      .eq("id", catId)

    if (error) {
      setSaveError("Could not save: " + error.message)
      return
    }
    setCategories(cats => cats.map(c => c.id === catId ? { ...c, monthly_budget: val, name: editName.trim(), icon: editIcon } : c))
    setEditingId(null)
    setSaveError("")
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" style={{ backdropFilter: "blur(12px)" }} />
    </div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categories & Budgets</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap the edit icon to rename or change the monthly limit.</p>
      </div>

      <div className="space-y-2">
        {categories.map(cat => {
          const spent = spentByCategory[cat.id] || 0
          const isEditing = editingId === cat.id
          return (
            <div key={cat.id} className="glass-panel rounded-2xl p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Category name</label>
                    <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1 h-12" autoFocus />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Icon</label>
                    <div className="mt-1">
                      <IconPicker value={editIcon} onChange={setEditIcon} />
                    </div>
                  </div>
                  {cat.type === "expense" && (
                    <div>
                      <label className="text-xs text-muted-foreground">Monthly budget</label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editBudget}
                          onChange={e => setEditBudget(e.target.value)}
                          className="pl-7 h-12"
                        />
                      </div>
                    </div>
                  )}
                  {saveError && <p className="text-sm text-destructive" style={{ backdropFilter: "blur(12px)" }}>{saveError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(cat.id)} className="gap-1.5 h-10">
                      <Check size={14} /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-1.5 h-10">
                      <X size={14} /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CategoryIcon name={cat.icon} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.type === "income" ? "Income source" : `Spent ${formatCurrency(spent)} of ${formatCurrency(cat.monthly_budget || 0)} this month`}
                    </p>
                  </div>
                  <button onClick={() => startEdit(cat)} className="text-muted-foreground hover:text-foreground p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <Pencil size={18} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}