import React, { useState, useEffect } from "react"
import * as Icons from "lucide-react"
import { ICON_OPTIONS } from "./CategoryIcon"
import { cn } from "@/lib/utils"

export default function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const SelectedIcon = Icons[value] || Icons.MoreHorizontal

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !event.target.closest('[data-icon-picker]')) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className="relative" data-icon-picker>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
      >
        <SelectedIcon size={18} />
        <span>Change icon</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 max-h-64 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-xl grid grid-cols-6 gap-2">
          {ICON_OPTIONS.map(iconName => {
            const Icon = Icons[iconName]
            if (!Icon) return null
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => { onChange(iconName); setOpen(false) }}
                className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-lg hover:bg-muted transition-colors",
                  value === iconName && "bg-primary/10 text-primary ring-1 ring-primary"
                )}
                title={iconName}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
