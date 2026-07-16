import React, { useState, useRef, useEffect } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, isAfter, startOfDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DatePicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(value ? new Date(value) : new Date())
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const days = eachDayOfInterval({ start: startOfMonth(view), end: endOfMonth(view) })
  const today = startOfDay(new Date())

  const select = (d) => {
    const iso = format(d, "yyyy-MM-dd")
    onChange(iso)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-border bg-transparent px-3 py-2 text-sm",
          open && "ring-1 ring-primary"
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? format(new Date(value), "MMM d, yyyy") : (placeholder || "Select date")}
        </span>
        <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
      </button>

      {open && (
        <div className="glass-panel absolute z-50 mt-2 w-72 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setView(subMonths(view, 1))} className="p-2 rounded-lg hover:bg-muted">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium">{format(view, "MMMM yyyy")}</span>
            <button type="button" onClick={() => setView(addMonths(view, 1))} className="p-2 rounded-lg hover:bg-muted">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(d => {
              const selected = value && isSameDay(d, new Date(value))
              const outside = !isSameMonth(d, view)
              const disabled = isBefore(d, today) && !isSameDay(d, today)
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => select(d)}
                  className={cn(
                    "h-9 w-9 rounded-lg text-sm transition-colors",
                    selected && "bg-primary text-primary-foreground",
                    !selected && !outside && "hover:bg-muted",
                    outside && "text-muted-foreground/40",
                    disabled && "opacity-30 cursor-not-allowed"
                  )}
                >
                  {format(d, "d")}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex justify-end">
            <button type="button" onClick={() => select(today)} className="text-xs text-primary hover:underline">Today</button>
          </div>
        </div>
      )}
    </div>
  )
}