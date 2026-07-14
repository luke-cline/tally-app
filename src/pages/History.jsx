import React, { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import CategoryIcon from "@/components/CategoryIcon"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function History() {
  const { workspaceId } = useWorkspace()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false)
      return
    }

    Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("date", { ascending: false }),

      supabase
        .from("categories")
        .select("*")
        .eq("workspace_id", workspaceId)
    ]).then(([txRes, catRes]) => {
      setTransactions(txRes.data || [])
      setCategories(catRes.data || [])
      setLoading(false)
    })
  }, [workspaceId])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterCategory !== "all" && t.category_id !== filterCategory) {
        return false
      }

      return true
    })
  }, [transactions, filterCategory])

  const grouped = useMemo(() => {
    const groups = {}

    filtered.forEach((t) => {
      const key = formatDate(t.date, { year: "numeric" })

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(t)
    })

    return groups
  }, [filtered])

  const catName = (id) => {
    return categories.find((c) => c.id === id)?.name || "Other"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Transaction History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All transactions for this workspace.
        </p>
      </div>

      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>

          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {date}
              </p>

              <div className="space-y-1">
                {txns.map((t) => (
                  <Link
                    to={`/edit/${t.id}`}
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/40 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        t.type === "income"
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      <CategoryIcon
                        name={catName(t.category_id)}
                        size={16}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {t.note || catName(t.category_id)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {catName(t.category_id)}
                      </p>
                    </div>

                    <p
                      className={cn(
                        "text-sm font-semibold whitespace-nowrap",
                        t.type === "income"
                          ? "text-accent"
                          : "text-foreground"
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}