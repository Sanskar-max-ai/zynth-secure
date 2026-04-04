'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { ScanResult } from '@/types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ExportButtonProps {
  result: ScanResult
}

export default function ExportButton({ result }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // BACKGROUND
      doc.setFillColor(6, 11, 20) // Deep dark blue/black
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')

      // HEADER
      doc.setTextColor(0, 255, 136) // Zynth Green
      doc.setFont('courier', 'bold')
      doc.setFontSize(24)
      doc.text('ZYNTH SECURE // TECHNICAL BRIEF', 20, 30)
      
      doc.setDrawColor(0, 255, 136)
      doc.setLineWidth(0.5)
      doc.line(20, 35, pageWidth - 20, 35)

      // INFO
      doc.setFontSize(10)
      doc.setTextColor(255, 255, 255)
      doc.text(`TARGET: ${result.url}`, 20, 45)
      doc.text(`SCAN ID: ${result.id}`, 20, 50)
      doc.text(`TIMESTAMP: ${new Date(result.scannedAt).toLocaleString()}`, 20, 55)
      doc.text(`SECURITY GRADE: ${result.score > 80 ? 'A' : result.score > 60 ? 'B' : 'C'}`, pageWidth - 80, 45)

      // SUMMARY
      doc.setFontSize(14)
      doc.setTextColor(0, 255, 136)
      doc.text('EXECUTIVE SUMMARY', 20, 70)
      
      doc.setFont('courier', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(200, 200, 200)
      const summaryLines = doc.splitTextToSize(result.executiveSummary || 'No summary available.', pageWidth - 40)
      doc.text(summaryLines, 20, 80)

      // FINDINGS TABLE
      const tableData = result.issues.map(issue => [
        issue.severity,
        issue.testName,
        issue.isFixed ? 'RESOLVED' : 'ACTIVE'
      ])

      // @ts-ignore - jspdf-autotable adds autoTable to jsPDF instances
      doc.autoTable({
        startY: 110,
        head: [['SEVERITY', 'VULNERABILITY', 'STATUS']],
        body: tableData,
        theme: 'plain',
        styles: {
          cellPadding: 3,
          fontSize: 9,
          font: 'courier',
          textColor: [255, 255, 255],
          fillColor: [10, 15, 25],
        },
        headStyles: {
          fillColor: [0, 255, 136],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [15, 20, 30],
        },
        margin: { left: 20, right: 20 }
      })

      // FOOTER
      const pageCount = (doc as any).internal.getNumberOfPages()
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(0, 255, 136, 0.4)
        doc.text('CONFIDENTIAL // ZYNTH AUTONOMOUS SECURITY ENGINE', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
      }

      doc.save(`Zynth_Report_${result.id}.pdf`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00ff88] transition-all hover:bg-[#00ff88]/10 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={14} />
      ) : (
        <FileDown size={14} />
      )}
      {loading ? 'Generating...' : 'Export PDF'}
    </button>
  )
}
