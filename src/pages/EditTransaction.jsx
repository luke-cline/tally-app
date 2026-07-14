import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EditTransaction() {
  const { id } = useParams()
  const { workspaceId } = useWorkspace()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!workspaceId || !id) return
    Promise.all([
      supabase.from("transactions").select("*").eq("id", id).single(),
      supabase.from("categories").select("*").eq("workspace_id", workspaceId)
    ]).then(([txRes, catRes]) => {
      if (txRes.data) {
        setType(txRes.data.type)
        setAmount(txRes.data.amount.toString())
        setCategoryId(txRes.data.category_id)
        setDate(txRes.data.date)
        setNote(txRes.data.note || "")
      }
      setCategories((catRes.data || []).filter(c => c.type === txRes.data?.type))
      setLoading(false)
    })
  }, [workspaceId, id])

  useEffect(() => {
    if (!workspaceId || loading) return
    supabase.from("categories").select("*").eq("workspace_id", workspaceId).eq("type", type)
      .then(({ data }) => setCategories(data || []))
  }, [type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !categoryId) return
    setSaving(true)
    setError("")
    const { error } = await supabase.from("transactions").update({
      amount: parseFloat(amount),
      category_id: categoryId,
      type,
      date,
      note
    }).eq("id", id)

    if (error) {
      setError("Could not save changes: " + error.message)
      setSaving(false)
    } else {
      navigate("/history")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this transaction? This can't be undone.")) return
    await supabase.from("transactions").delete().eq("id", id)
    navigate("/history")
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setType("expense")}
            className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium",
              type === "expense" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground")}>
            <ArrowDownRight size={18} /> Expense
          </button>
          <button type="button" onClick={() => setType("income")}
            className={cn("flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium",
              type === "income" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground")}>
            <ArrowUpRight size={18} /> Income
          </button>
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">$</span>
            <Input id="amount" type="number" step="0.01" min="0" value={amount}
              onChange={e => setAmount(e.target.value)} className="pl-10 text-2xl font-semibold h-14" required />
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1.5 h-12"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1.5 h-12" required />
        </div>

        <div>
          <Label htmlFor="note">Note</Label>
          <Input id="note" type="text" value={note} onChange={e => setNote(e.target.value)} className="mt-1.5 h-12" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving || !amount} className="w-full h-12 text-base">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={handleDelete} className="w-full h-12 text-destructive gap-2">
          <Trash2 size={16} /> Delete Transaction
        </Button>
      </form>
    </div>
  )
}