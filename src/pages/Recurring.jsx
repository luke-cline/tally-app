import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useAuth } from "@/context/AuthContext"
import CategoryIcon from "@/components/CategoryIcon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Plus, Trash2, X } from "lucide-react"
import { formatCurrency, formatDate, daysUntil } from "@/lib/format"

export default function Recurring() {
  const { workspaceId } = useWorkspace()
  const { user } = useAuth()
  const [recurring, setRecurring] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", amount: "", category_id: "",
    next_due_date: new Date().toISOString().split("T")[0], frequency: "monthly"
  })

  useEffect(() => {
  if (!workspaceId) { setLoading(false); return }
    Promise.all([
      supabase.from("recurring_transactions").select("*").eq("workspace_id", workspaceId).order("next_due_date"),
      supabase.from("categories").select("*").eq("workspace_id", workspaceId)
    ]).then(([recRes, catRes]) => {
      setRecurring(recRes.data || [])
      setCategories(catRes.data || [])
      if (catRes.data?.length > 0) setForm(f => ({ ...f, category_id: catRes.data[0].id }))
      setLoading(false)
    })
  }, [workspaceId])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError("")
    const { error } = await supabase.from("recurring_transactions").insert({
      ...form,
      amount: parseFloat(form.amount),
      workspace_id: workspaceId,
      type: "expense",
      added_by: user.id
    })
    if (error) {
      setError("Could not add recurring transaction.")
      return
    }
    const { data } = await supabase.from("recurring_transactions").select("*").eq("workspace_id", workspaceId).order("next_due_date")
    setRecurring(data || [])
    setShowForm(false)
    setForm({ name: "", amount: "", category_id: categories[0]?.id || "", next_due_date: new Date().toISOString().split("T")[0], frequency: "monthly" })
  }

  const handleDelete = async (id) => {
    await supabase.from("recurring_transactions").delete().eq("id", id)
    setRecurring(rec => rec.filter(r => r.id !== id))
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Recurring Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly bills and subscriptions.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span className="ml-1.5">{showForm ? "Cancel" : "Add"}</span>
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-border bg-card p-4 space-y-4">
          <div>
            <Label htmlFor="r-name">Name</Label>
            <Input id="r-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="r-amount">Amount</Label>
              <Input id="r-amount" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="mt-1.5" required />
            </div>
            <div>
              <Label htmlFor="r-date">Next due</Label>
              <Input id="r-date" type="date" value={form.next_due_date} onChange={e => setForm({ ...form, next_due_date: e.target.value })} className="mt-1.5" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Add Recurring Transaction</Button>
        </form>
      )}

      <div className="space-y-2">
        {recurring.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <p>No recurring transactions yet.</p>
          </div>
        ) : (
          recurring.map(r => {
            const days = daysUntil(r.next_due_date)
            const cat = categories.find(c => c.id === r.category_id)
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CategoryIcon name={cat?.name} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(r.next_due_date)} · {r.frequency}
                    {days >= 0 ? ` · in ${days} day${days !== 1 ? "s" : ""}` : ` · ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`}
                  </p>
                </div>
                <p className="font-semibold text-sm whitespace-nowrap">{formatCurrency(r.amount)}</p>
                <button onClick={() => handleDelete(r.id)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}