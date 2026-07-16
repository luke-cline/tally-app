import React, { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark")
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    setTransitioning(true)
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("theme", dark ? "dark" : "light")
    
    // Reset transitioning state after transition completes
    const timer = setTimeout(() => setTransitioning(false), 250)
    return () => clearTimeout(timer)
  }, [dark])

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setDark(!dark)}
      disabled={transitioning}
      className="transition-all duration-250 min-w-[44px] min-h-[44px]"
    >
      <span className="transition-transform duration-100">
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </Button>
  )
}