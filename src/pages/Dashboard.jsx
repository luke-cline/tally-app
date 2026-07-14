import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import CategoryIcon from "@/components/CategoryIcon"
import ProgressBar from "@/components/ProgressBar"
import StatCard from "@/components/StatCard"
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"
import { formatCurrency, formatMonthYear } from "@/lib/format"

export default function Dashboard() {
  const { workspaceId } = useWorkspace()
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (!workspaceId) { setLoading(false); return }
    Promise.all([
      supabase.from("categories").select("*").eq("workspace_id", workspaceId).order("sort_order"),
      supabase.from("transactions").select("*").eq("workspace_id", workspaceId).order("date", { ascending: false })
    ]).then(([catRes, txRes]) => {
      setCategories(catRes.data || [])
      setTransactions(txRes.data || [])
      setLoading(false)
    })
  }, [workspaceId])

  const now = new Date()
  const monthTxns = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }), [transactions])

  const totalIncome = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
  const net = totalIncome - totalExpense

  const spendingByCategory = useMemo(() => {
    const map = {}
    monthTxns.filter(t => t.type === "expense").forEach(t => {
      map[t.category_id] = (map[t.category_id] || 0) + Number(t.amount)
    })
    return map
  }, [monthTxns])

  const expenseCategories = categories.filter(c => c.type === "expense")
  const totalBudget = expenseCategories.reduce((s, c) => s + Number(c.monthly_budget || 0), 0)
  const totalRemaining = totalBudget - totalExpense

  if (loading) {
    return <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold capitalize">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatMonthYear()}</p>
        </div>
        <Link to="/add" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Income" value={formatCurrency(totalIncome)} icon={ArrowUpRight} accent="income" />
        <StatCard label="Expenses" value={formatCurrency(totalExpense)} icon={ArrowDownRight} accent="expense" />
        <StatCard label="Net" value={formatCurrency(net)} icon={Wallet} accent={net >= 0 ? "income" : "expense"} />
        <StatCard label="Remaining" value={formatCurrency(totalRemaining)} icon={Wallet} accent={totalRemaining >= 0 ? "income" : "expense"} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Budget Progress</h2>
        {expenseCategories.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            <p>No categories set up yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expenseCategories.map(cat => {
              const spent = spendingByCategory[cat.id] || 0
              const budget = Number(cat.monthly_budget || 0)
              const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0
              const over = spent > budget && budget > 0
              return (
                <div key={cat.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(spent)} <span className="opacity-60">/ {formatCurrency(budget)}</span>
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${over ? "text-destructive" : "text-muted-foreground"}`}>{pct}%</span>
                  </div>
                  <ProgressBar value={spent} max={budget} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}