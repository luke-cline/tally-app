import React from "react"

export default function StatCard({ label, value, icon: Icon, accent }) {
  const color = accent === "income" ? "var(--primary)" : "var(--destructive)"
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={16} style={{ color }} />}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}