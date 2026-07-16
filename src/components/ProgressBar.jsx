import React from "react"

export default function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const over = value > max && max > 0
  return (
    <div className="glass-panel h-2 w-full rounded-full overflow-hidden" style={{ backdropFilter: "blur(6px)" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          backgroundColor: over ? "var(--destructive)" : "var(--primary)"
        }}
      />
    </div>
  )
}