import React from "react"
import { useWorkspace } from "@/context/WorkspaceContext"
import { cn } from "@/lib/utils"

export default function WorkspaceToggle() {
  const { workspaceType, setWorkspaceType } = useWorkspace()
  return (
    <div className="glass-panel flex rounded-lg p-1 gap-1" style={{ backdropFilter: "blur(12px)" }}>
      {["household", "business"].map(type => (
        <button
          key={type}
          onClick={() => setWorkspaceType(type)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
            workspaceType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {type}
        </button>
      ))}
    </div>
  )
}