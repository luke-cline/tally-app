import { formatCurrency } from "./format"

// Generate SVG content for the chart
export function generateSvgChart(svgElement, width = 800, height = 320) {
  if (!svgElement) return null
  
  const serializer = new XMLSerializer()
  let svgContent = serializer.serializeToString(svgElement)
  
  // Ensure proper SVG structure
  if (!svgContent.startsWith('<svg')) {
    svgContent = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${svgContent}</svg>`
  }
  
  // Add self-contained styles
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${svgContent.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
</svg>`
  
  return fullSvg
}

// Generate SVG download
export async function downloadSvg(svgContent, filename) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Generate PDF download using jsPDF
export async function downloadPdf(svgContent, insights, filename) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [612, 792] // US Letter
  })

  // Add header
  doc.setFontSize(24)
  doc.text('Tally', 48, 48)
  doc.setFontSize(16)
  doc.setFont(undefined, 'normal')
  doc.text('Monthly Spending Report', 48, 76)
  
  // Add month/year
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(insights.monthYear, 48, 98)
  
  // Add stats section
  doc.setFontSize(11)
  doc.setTextColor(0)
  let yPos = 130
  
  doc.text('Total Spent', 48, yPos)
  doc.setFontSize(14)
  doc.text(insights.totalSpent, 48, yPos + 20)
  
  doc.setFontSize(11)
  doc.text('Average Daily', 168, yPos)
  doc.setFontSize(14)
  doc.text(insights.avgDaily, 168, yPos + 20)
  
  doc.text('Highest Day', 308, yPos)
  doc.setFontSize(14)
  doc.text(insights.highestDay, 308, yPos + 20)
  
  doc.text('Today', 448, yPos)
  doc.setFontSize(14)
  doc.text(insights.today, 448, yPos + 20)
  
  // Convert SVG to image and add to PDF
  if (svgContent) {
    const img = new Image()
    img.src = 'data:image/svg+xml;base64,' + btoa(svgContent)
    
    await new Promise((resolve) => {
      img.onload = resolve
    })
    
    // Add chart image (scaled to fit)
    const chartWidth = 516
    const chartHeight = 240
    doc.addImage(img, 'PNG', 48, yPos + 40, chartWidth, chartHeight)
  }
  
  doc.save(filename)
}

// Generate DOCX download
export async function downloadDocx(svgContent, insights, filename) {
  const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } = await import('docx')
  const { default: jsPDF } = await import('jspdf')
  
  // Convert SVG to a data URL for the image
  let imageData = null
  if (svgContent) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = 'data:image/svg+xml,' + encodeURIComponent(svgContent)
    
    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = 600
        canvas.height = 300
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve()
      }
    })
    
    imageData = canvas.toDataURL('image/png').split(',')[1]
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: "Tally",
              bold: true,
              size: 32
            })
          ]
        }),
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: "Monthly Spending Report",
              size: 24
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: insights.monthYear,
              size: 20
            })
          ]
        }),
        new Paragraph({
          text: " "
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Summary",
              bold: true,
              size: 16
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Total Spent: ${insights.totalSpent}    Avg Daily: ${insights.avgDaily}    Highest Day: ${insights.highestDay}    Today: ${insights.today}`,
              size: 14
            })
          ]
        }),
        ...(imageData ? [
          new Paragraph({
            children: [
              new ImageRun({
                data: imageData,
                transformation: {
                  width: 600,
                  height: 300
                }
              })
            ]
          })
        ] : [])
      ]
    }]
  })
  
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}