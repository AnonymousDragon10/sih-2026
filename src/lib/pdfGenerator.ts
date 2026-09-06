import { jsPDF } from 'jspdf'
import type { ClinicalSummary, RedFlag } from '../types'

interface PdfOptions {
  patientName?: string
  patientAge?: string
  patientGender?: string
  abhaId?: string
  language?: string
  mode?: string
}

const sections: { key: keyof ClinicalSummary; label: string }[] = [
  { key: 'chief_complaint', label: 'Chief Complaint' },
  { key: 'hpi', label: 'History of Present Illness' },
  { key: 'past_medical_history', label: 'Past Medical / Surgical History' },
  { key: 'drug_allergy_history', label: 'Drug & Allergy History' },
  { key: 'family_history', label: 'Family History' },
  { key: 'personal_history', label: 'Personal History' },
  { key: 'review_of_systems', label: 'Review of Systems' },
  { key: 'prior_investigations', label: 'Prior Investigations' },
]

function safeFileName(value: string): string {
  return value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'patient'
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, width: number, fontSize = 10): number {
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text || 'Not specified', width) as string[]
  doc.text(lines, x, y)
  return y + lines.length * (fontSize * 0.45 + 3)
}

export async function generatePrescriptionPdf(
  summary: ClinicalSummary,
  redFlags: RedFlag[] = [],
  options: PdfOptions = {}
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let logoData: string | null = null
  try {
    const response = await fetch('/WhatsApp_Image_2026-09-05 copy.jpeg')
    const bytes = new Uint8Array(await response.arrayBuffer())
    let binary = ''
    bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
    logoData = `data:image/jpeg;base64,${btoa(binary)}`
  } catch {
    logoData = null
  }
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  let y = 20

  doc.setFillColor(239, 246, 255)
  doc.rect(0, 0, pageWidth, 38, 'F')
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 10, 17, 17, 4, 4, 'F')
  if (logoData) {
    doc.addImage(logoData, 'JPEG', margin + 1, 11, 15, 15)
  } else {
    doc.setFillColor(51, 128, 252)
    doc.roundedRect(margin, 10, 17, 17, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.text('M', margin + 5.2, 21.5)
  }
  doc.setTextColor(26, 56, 143)
  doc.setFontSize(18)
  doc.text('MediKiosk', margin + 22, 17)
  doc.setTextColor(89, 159, 255)
  doc.setFontSize(8)
  doc.text('AI Clinical History Platform', margin + 22, 23)
  doc.setTextColor(75, 85, 99)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 15, { align: 'right' })
  doc.text(`Mode: ${options.mode || 'allopathic'}`, pageWidth - margin, 21, { align: 'right' })
  y = 48

  doc.setFillColor(240, 247, 255)
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 3, 3, 'F')
  doc.setTextColor(31, 41, 55)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient:', margin + 4, y + 7)
  doc.text('Age:', margin + 70, y + 7)
  doc.text('Gender:', margin + 104, y + 7)
  doc.text('ABHA:', margin + 145, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.text(options.patientName || 'N/A', margin + 18, y + 7)
  doc.text(options.patientAge || 'N/A', margin + 82, y + 7)
  doc.text(options.patientGender || 'N/A', margin + 119, y + 7)
  doc.text(options.abhaId || 'N/A', margin + 158, y + 7)
  doc.text(`Language: ${options.language || 'en'}`, margin + 4, y + 13)
  y += 28

  if (redFlags.length > 0) {
    doc.setFillColor(254, 242, 242)
    doc.setDrawColor(239, 68, 68)
    doc.setLineWidth(0.8)
    const height = 14 + redFlags.length * 8
    doc.roundedRect(margin, y, pageWidth - margin * 2, height, 3, 3, 'FD')
    doc.setTextColor(185, 28, 28)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('RED FLAG DETECTION', margin + 5, y + 8)
    doc.setFontSize(8.5)
    redFlags.forEach((flag, index) => {
      doc.text(`• ${flag.description} [${flag.severity.toUpperCase()}]`, margin + 5, y + 15 + index * 7)
    })
    y += height + 10
  }

  doc.setTextColor(26, 56, 143)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('CLINICAL HISTORY SUMMARY', margin, y)
  y += 10

  sections.forEach((section) => {
    if (y > pageHeight - 28) {
      doc.addPage()
      y = 20
    }
    doc.setTextColor(30, 58, 95)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(section.label.toUpperCase(), margin, y)
    doc.setDrawColor(224, 231, 255)
    doc.line(margin, y + 2, pageWidth - margin, y + 2)
    y += 7
    doc.setTextColor(55, 65, 81)
    doc.setFont('helvetica', 'normal')
    y = addWrappedText(doc, String(summary[section.key] || 'Not specified'), margin, y, pageWidth - margin * 2, 9)
    y += 5
  })

  if (summary.ayush_assessment) {
    if (y > pageHeight - 65) {
      doc.addPage()
      y = 20
    }
    doc.setFillColor(255, 251, 235)
    doc.setDrawColor(245, 158, 11)
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10 + Object.keys(summary.ayush_assessment).length * 6, 3, 3, 'FD')
    doc.setTextColor(180, 83, 9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('AYUSH ASSESSMENT - DASHAVIDHA PARIKSHA', margin + 5, y + 7)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    Object.entries(summary.ayush_assessment).forEach(([key, value], index) => {
      doc.text(`${key.replace(/_/g, ' ')}: ${value}`, margin + 5, y + 14 + index * 6)
    })
    y += 18 + Object.keys(summary.ayush_assessment).length * 6
  }

  doc.setTextColor(156, 163, 175)
  doc.setFontSize(7)
  doc.text('MediKiosk | This summary is a draft for physician review. The physician retains full control.', pageWidth / 2, pageHeight - 12, { align: 'center' })
  doc.save(`medikiosk-prescription-${safeFileName(options.patientName || 'patient')}.pdf`)
}
