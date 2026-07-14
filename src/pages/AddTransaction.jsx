import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddTransaction() {
  const { workspaceId } = useWorkspace()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [type, setType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!workspaceId) return
    supabase.from("categories").select("*").eq("workspace_id", workspaceId).eq("type", type)
      .then(({ data }) => {
        setCategories(data || [])
        if (data && data.length > 0) setCategoryId(data[0].id)
      })
  }, [workspaceId, type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !categoryId) return
    setSaving(true)
    setError("")
    const { error } = await supabase.from("transactions").insert({
      amount: parseFloat(amount),
      category_id: categoryId,
      type,
      date,
      note,
      added_by: user.id,
      workspace_id: workspaceId
    })
    if (error) {
      setError("Could not save transaction. Please try again.")
      setSaving(false)
    } else {
      navigate("/")
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add Transaction</h1>
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
            <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" value={amount}
              onChange={e => setAmount(e.target.value)} className="pl-10 text-2xl font-semibold h-14" required autoFocus />
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
          <Input id="note" type="text" placeholder="Optional note" value={note} onChange={e => setNote(e.target.value)} className="mt-1.5 h-12" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving || !amount} className="w-full h-12 text-base">
          {saving ? "Saving..." : "Add Transaction"}
        </Button>
      </form>
    </div>
  )
}