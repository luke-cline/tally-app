import React from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Plus, Tag, Repeat, History as HistoryIcon, LogOut } from "lucide-react"
import WorkspaceToggle from "./WorkspaceToggle"
import ThemeToggle from "./ThemeToggle"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add", label: "Add", icon: Plus },
  { to: "/categories", label: "Categories", icon: Tag },
  { to: "/recurring", label: "Recurring", icon: Repeat },
  { to: "/history", label: "History", icon: HistoryIcon },
]

export default function Layout({ children }) {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-lg">Tally</span>
          <div className="flex items-center gap-3">
            <WorkspaceToggle />
            <ThemeToggle />
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card sm:hidden">
        <div className="flex justify-around py-2">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <nav className="hidden sm:flex max-w-4xl mx-auto px-4 gap-1 border-t border-border py-2">
        {navItems.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}