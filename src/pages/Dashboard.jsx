import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import CategoryIcon from "@/components/CategoryIcon"
import ProgressBar from "@/components/ProgressBar"
import StatCard from "@/components/StatCard"
import { Plus, ArrowUpRight, ArrowDownRight, Wallet, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency, formatMonthYear } from "@/lib/format"

function SpendingTrend({ transactions, viewDate }) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() - i, 1)
    months.push(d)
  }

  const data = months.map(m => {
    const start = new Date(m.getFullYear(), m.getMonth(), 1)
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0)
    const total = transactions
      .filter(t => {
        const d = new Date(t.date)
        return t.type === "expense" && d >= start && d <= end
      })
      .reduce((s, t) => s + Number(t.amount), 0)
    return { label: m.toLocaleDateString("en-US", { month: "short" }), total }
  })

  const max = Math.max(...data.map(d => d.total), 1)
  const width = 600
  const height = 160
  const padding = 24
  const chartW = width - padding * 2
  const chartH = height - padding * 2

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartW
    const y = padding + chartH - (d.total / max) * chartH
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-border" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />
        ))}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 6} textAnchor="middle" className="text-[10px] fill-muted-foreground">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const { workspaceId } = useWorkspace()
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(new Date())

  useEffect(() => {
  if (!workspaceId) { setLoading(false); return }
    Promise.all([
      supabase.from("categories").select("*").eq("workspace_id", workspaceId).is("deleted_at", null).order("sort_order"),
      supabase.from("transactions").select("*").eq("workspace_id", workspaceId).is("deleted_at", null).order("date", { ascending: false })
    ]).then(([catRes, txRes]) => {
      setCategories(catRes.data || [])
      setTransactions(txRes.data || [])
      setLoading(false)
    })
  }, [workspaceId])

  const monthTxns = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear()
  }), [transactions, viewDate])

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
      <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" style={{ backdropFilter: "blur(12px)" }} />
    </div>
  }

  const hasBudget = expenseCategories.length > 0

  const monthLabel = formatMonthYear(viewDate)

  const prevMonth = () => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  const nextMonth = () => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold capitalize">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{monthLabel}</p>
          </div>
          <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ChevronRight size={20} />
          </button>
        </div>
        {hasBudget && (
          <Link to="/add" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus size={16} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Income" value={formatCurrency(totalIncome)} icon={ArrowUpRight} accent="income" />
        <StatCard label="Expenses" value={formatCurrency(totalExpense)} icon={ArrowDownRight} accent="expense" />
        <StatCard label="Net" value={formatCurrency(net)} icon={Wallet} accent={net >= 0 ? "income" : "expense"} />
        <StatCard label="Remaining" value={formatCurrency(totalRemaining)} icon={Wallet} accent={totalRemaining >= 0 ? "income" : "expense"} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Spending Trend</h2>
        <div className="glass-panel rounded-2xl p-4">
          <SpendingTrend transactions={transactions} viewDate={viewDate} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Budget Progress</h2>
        {expenseCategories.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-muted-foreground">
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
                <div key={cat.id} className="glass-panel rounded-2xl p-4">
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