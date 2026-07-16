import React, { useState, useEffect, useMemo, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useWorkspace } from "@/context/WorkspaceContext"
import { formatCurrency, formatMonthYear } from "@/lib/format"
import { ChevronLeft, ChevronRight, Download, FileText, FileImage, FileType2 } from "lucide-react"
import { downloadSvg, downloadPdf, downloadDocx } from "@/lib/exportUtils"

// Get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Generate daily spending data for a given month
function useDailySpending(transactions, year, month) {
  return useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      total: 0,
      count: 0,
      transactions: []
    }))

    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const d = new Date(t.date)
        if (d >= start && d <= end) {
          const dayIndex = d.getDate() - 1
          if (dayIndex >= 0 && dayIndex < daysInMonth) {
            dailyData[dayIndex].total += Number(t.amount)
            dailyData[dayIndex].count += 1
            dailyData[dayIndex].transactions.push(t)
          }
        }
      })

    return dailyData
  }, [transactions, year, month])
}

// Animated SVG Chart Component
function SpendingTrendChart({ dailyData, selectedMonth, onHoverData, svgRef }) {
  const animationProgress = useState(0)[0]
  const [animProgress, setAnimProgress] = useState(0)
  const animationRef = useRef(null)

  const width = 800
  const height = 320
  const padding = { top: 24, right: 32, bottom: 48, left: 64 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxSpend = Math.max(...dailyData.map(d => d.total), 1)
  const daysInMonth = dailyData.length

  // Generate points for the line chart
  const points = dailyData.map((d, i) => {
    const x = padding.left + (i / (daysInMonth - 1)) * chartW
    const y = padding.top + chartH - Math.max((d.total / maxSpend) * chartH, 0)
    return { x, y, day: d.day, total: d.total, count: d.count }
  })

  // Create smooth curve path
  const pathD = useMemo(() => {
    if (points.length < 2) return ""
    
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cp1x = prev.x + (curr.x - prev.x) / 2
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) / 2
      const cp2y = curr.y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }
    return d
  }, [points])

  // Animate on mount and when month changes
  useEffect(() => {
    setAnimProgress(0)
    let startTime = null
    const duration = 400
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setAnimProgress(progress)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [selectedMonth])

  // Create clipped path for animation
  const animatedPathD = useMemo(() => {
    if (points.length < 2 || animProgress === 0) return ""
    
    let currentLength = 0
    let totalLength = 0
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      totalLength += Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
    }
    
    const drawLength = totalLength * animProgress
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const segLength = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
      
      if (currentLength + segLength >= drawLength) {
        const remaining = drawLength - currentLength
        const ratio = remaining / segLength
        const x = prev.x + (curr.x - prev.x) * ratio
        const y = prev.y + (curr.y - prev.y) * ratio
        
        let d = `M ${points[0].x} ${points[0].y}`
        for (let j = 1; j <= i; j++) {
          if (j === i) {
            d += ` L ${x} ${y}`
          } else {
            const p = points[j]
            const pp = points[j - 1]
            const cp1x = pp.x + (p.x - pp.x) / 2
            const cp1y = pp.y
            const cp2x = p.x - (p.x - pp.x) / 2
            const cp2y = p.y
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`
          }
        }
        return d
      }
      currentLength += segLength
    }
    return pathD
  }, [points, animProgress])

  return (
    <div className="relative w-full" ref={svgRef}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={padding.top + chartH * (1 - ratio)}
            x2={width - padding.right}
            y2={padding.top + chartH * (1 - ratio)}
            stroke="currentColor"
            className="text-border opacity-30"
            strokeWidth="1"
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <text
            key={i}
            x={padding.left - 8}
            y={padding.top + chartH * (1 - ratio)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-muted-foreground"
          >
            {formatCurrency(Math.round(maxSpend * ratio))}
          </text>
        ))}
        
        {/* X-axis - show selected days */}
        {dailyData.map((_, i) => {
          if (i === 0 || i === daysInMonth - 1 || (daysInMonth > 30 && (i + 1) % 5 === 0) || (daysInMonth <= 30 && (i + 1) % 10 === 0)) {
            return (
              <text
                key={i}
                x={padding.left + (i / (daysInMonth - 1)) * chartW}
                y={height - 24}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {i + 1}
              </text>
            )
          }
          return null
        })}
        
        {/* Area fill with gradient */}
        {animProgress > 0 && animatedPathD && (
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        )}
        
        {/* Animated area */}
        {animProgress > 0 && animatedPathD && (
          <path
            d={`${animatedPathD} L ${points[points.length - 1]?.x || 0} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
            fill="url(#areaGradient)"
          />
        )}
        
        {/* Animated line */}
        {animProgress > 0 && (
          <path
            d={animatedPathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="5"
            fill="var(--card)"
            stroke="var(--primary)"
            strokeWidth="2"
            className="cursor-pointer transition-all hover:r-7"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              onHoverData({ 
                day: p.day, 
                amount: p.total, 
                count: p.count,
                x: rect.left + rect.width / 2,
                y: rect.top
              })
            }}
            onMouseLeave={() => onHoverData(null)}
          />
        ))}
      </svg>
    </div>
  )
}

// Insights Panel Component
function InsightsPanel({ dailyData, selectedMonth }) {
  const totalSpent = dailyData.reduce((sum, d) => sum + d.total, 0)
  const daysWithData = dailyData.filter(d => d.total > 0).length
  const averageDaily = daysWithData > 0 ? totalSpent / daysWithData : 0
  const highestDay = dailyData.reduce((max, d) => d.total > max.total ? d : max, { day: 0, total: 0 })
  
  const today = new Date()
  const currentDayInMonth = selectedMonth.getMonth() === today.getMonth() && selectedMonth.getFullYear() === today.getFullYear()
    ? today.getDate()
    : 0
  const todaysSpend = currentDayInMonth > 0 ? dailyData[currentDayInMonth - 1]?.total || 0 : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="glass-panel rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
        <p className="text-lg font-semibold">{formatCurrency(totalSpent)}</p>
      </div>
      <div className="glass-panel rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Avg Daily</p>
        <p className="text-lg font-semibold">{formatCurrency(averageDaily)}</p>
      </div>
      <div className="glass-panel rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Highest Day</p>
        <p className="text-lg font-semibold">
          {highestDay.day > 0 ? `${highestDay.day}` : "-"}
        </p>
        <p className="text-xs text-muted-foreground">{formatCurrency(highestDay.total)}</p>
      </div>
      <div className="glass-panel rounded-2xl p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Today</p>
        <p className="text-lg font-semibold">{formatCurrency(todaysSpend)}</p>
      </div>
    </div>
  )
}

export default function MonthlySpendingTrendChart() {
  const { workspaceId } = useWorkspace()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(new Date())
  const [hoverData, setHoverData] = useState(null)
  const [downloadFormat, setDownloadFormat] = useState("pdf")
  const [downloading, setDownloading] = useState(false)
  const svgRef = useRef(null)
  
  // Fetch and subscribe to real-time updates
  useEffect(() => {
    if (!workspaceId) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    // Initial fetch
    supabase
      .from("transactions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .order("date", { ascending: false })
      .then(({ data }) => {
        setTransactions(data || [])
        setLoading(false)
      })

    // Real-time subscription
    const channel = supabase
      .channel(`transactions:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `workspace_id=eq.${workspaceId}`
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTransactions(prev => [payload.new, ...prev.filter(t => t.id !== payload.new.id)])
          } else if (payload.eventType === "UPDATE") {
            setTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new : t))
          } else if (payload.eventType === "DELETE") {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspaceId])

  const dailyData = useDailySpending(
    transactions,
    viewDate.getFullYear(),
    viewDate.getMonth()
  )

  const prevMonth = () => {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    const today = new Date()
    today.setDate(1)
    today.setHours(0, 0, 0, 0)
    
    if (next < today) {
      setViewDate(next)
    }
  }

  const canGoNext = !(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1) >= new Date())

  // Handle download
  const handleDownload = async () => {
    setDownloading(true)
    const monthStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`
    
    // Get SVG content
    const svgElement = svgRef.current?.querySelector('svg')
    const serializer = new XMLSerializer()
    const svgContent = svgElement ? serializer.serializeToString(svgElement) : null
    
    // Calculate insights
    const totalSpent = dailyData.reduce((sum, d) => sum + d.total, 0)
    const daysWithData = dailyData.filter(d => d.total > 0).length
    const averageDaily = daysWithData > 0 ? totalSpent / daysWithData : 0
    const highestDay = dailyData.reduce((max, d) => d.total > max.total ? d : max, { day: 0, total: 0 })
    
    const today = new Date()
    const currentDayInMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
      ? today.getDate()
      : 0
    const todaysSpend = currentDayInMonth > 0 ? dailyData[currentDayInMonth - 1]?.total || 0 : 0
    
    const insights = {
      monthYear: formatMonthYear(viewDate),
      totalSpent: formatCurrency(totalSpent),
      avgDaily: formatCurrency(averageDaily),
      highestDay: `${highestDay.day > 0 ? highestDay.day : '-'} (${formatCurrency(highestDay.total)})`,
      today: formatCurrency(todaysSpend)
    }
    
    try {
      if (downloadFormat === "svg") {
        await downloadSvg(svgContent, `tally-spending-trend-${monthStr}.svg`)
      } else if (downloadFormat === "pdf") {
        await downloadPdf(svgContent, insights, `tally-report-${monthStr}.pdf`)
      } else if (downloadFormat === "docx") {
        await downloadDocx(svgContent, insights, `tally-report-${monthStr}.docx`)
      }
    } catch (err) {
      console.error("Download error:", err)
      alert("Failed to generate report. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with navigation and download controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold capitalize">
            {formatMonthYear(viewDate)}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Format selector and download button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 glass-panel rounded-lg p-1">
            <button
              type="button"
              onClick={() => setDownloadFormat("pdf")}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${downloadFormat === "pdf" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="PDF"
            >
              <FileText size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDownloadFormat("docx")}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${downloadFormat === "docx" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="DOCX"
            >
              <FileType2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setDownloadFormat("svg")}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${downloadFormat === "svg" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              title="SVG"
            >
              <FileImage size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span className="hidden sm:inline">{downloading ? "Preparing..." : "Download"}</span>
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="glass-panel rounded-2xl p-6">
        <SpendingTrendChart
          dailyData={dailyData}
          selectedMonth={viewDate}
          onHoverData={setHoverData}
          svgRef={svgRef}
        />
        
        {/* Tooltip */}
        {hoverData && (
          <div
            className="absolute glass-panel rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10"
            style={{
              left: hoverData.x - 60,
              top: hoverData.y - 60,
              backdropFilter: "blur(12px)"
            }}
          >
            <p className="text-sm font-medium">{hoverData.day} {formatMonthYear(viewDate).split(' ')[0]}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(hoverData.amount)}</p>
            {hoverData.count > 1 && (
              <p className="text-xs text-muted-foreground">{hoverData.count} transactions</p>
            )}
          </div>
        )}
      </div>

      {/* Insights Panel */}
      <InsightsPanel
        dailyData={dailyData}
        selectedMonth={viewDate}
      />
    </div>
  )
}