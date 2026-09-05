import type { ClinicalSummary, RedFlag } from '../types'

const SUMMARY_SECTIONS: { key: keyof ClinicalSummary; label: string }[] = [
  { key: 'chief_complaint', label: 'Chief Complaint' },
  { key: 'hpi', label: 'History of Present Illness' },
  { key: 'past_medical_history', label: 'Past Medical / Surgical History' },
  { key: 'drug_allergy_history', label: 'Drug & Allergy History' },
  { key: 'family_history', label: 'Family History' },
  { key: 'personal_history', label: 'Personal History' },
  { key: 'review_of_systems', label: 'Review of Systems' },
  { key: 'prior_investigations', label: 'Prior Investigations' },
]

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

interface PdfOptions {
  patientName?: string
  patientAge?: string
  patientGender?: string
  abhaId?: string
  language?: string
  mode?: string
  generatedAt?: string
}

export function generatePrescriptionPdf(
  summary: ClinicalSummary,
  redFlags: RedFlag[] = [],
  options: PdfOptions = {}
): void {
  const hasRedFlags = redFlags.length > 0
  const now = options.generatedAt || new Date().toLocaleString()

  const redFlagBlock = hasRedFlags
    ? `
    <div style="background: #fef2f2; border: 3px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 24px; height: 24px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">!</div>
        <span style="color: #dc2626; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Red Flag Detection</span>
      </div>
      ${redFlags
        .map(
          (flag) =>
            `<div style="color: #b91c1c; font-size: 13px; margin-top: 4px; font-weight: 600;">${escapeHtml(flag.description)} [${escapeHtml(flag.severity.toUpperCase())}]</div>`
        )
        .join('')}
    </div>`
    : ''

  const ayushBlock = summary.ayush_assessment
    ? `
    <div style="margin-top: 24px; padding: 16px; background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px;">
      <div style="font-size: 15px; font-weight: 700; color: #b45309; margin-bottom: 12px;">AYUSH Assessment - Dashavidha Pariksha</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        ${Object.entries(summary.ayush_assessment)
          .map(
            ([key, value]) =>
              `<div style="font-size: 12px;"><span style="font-weight: 600; color: #92400e; text-transform: capitalize;">${escapeHtml(key.replace(/_/g, ' '))}:</span> <span style="color: #78350f;">${escapeHtml(value as string)}</span></div>`
          )
          .join('')}
      </div>
    </div>`
    : ''

  const sectionsHtml = SUMMARY_SECTIONS.map(
    (section) => `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 700; color: #1e3a5f; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e0e7ff; padding-bottom: 2px;">${section.label}</div>
        <div style="font-size: 13px; color: #374151; line-height: 1.6;">${escapeHtml((summary[section.key] as string) || 'Not specified')}</div>
      </div>`
  ).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Clinical History Summary - ${escapeHtml(options.patientName || 'Patient')}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #1f2937; background: white; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #3380fc; padding-bottom: 20px; margin-bottom: 24px; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-circle { width: 48px; height: 48px; background: linear-gradient(135deg, #3380fc, #22d3ee); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; }
  .logo-text { font-size: 22px; font-weight: 700; color: #1a388f; }
  .logo-sub { font-size: 11px; color: #599fff; }
  .meta { text-align: right; font-size: 11px; color: #6b7280; }
  .patient-bar { background: #f0f7ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 24px; flex-wrap: wrap; }
  .patient-bar div { font-size: 12px; }
  .patient-bar .label { color: #6b7280; font-weight: 600; }
  .patient-bar .value { color: #1f2937; font-weight: 500; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-circle">M</div>
      <div>
        <div class="logo-text">MediKiosk</div>
        <div class="logo-sub">AI Clinical History Platform</div>
      </div>
    </div>
    <div class="meta">
      <div>Generated: ${escapeHtml(now)}</div>
      <div>Mode: ${escapeHtml(options.mode || 'allopathic')}</div>
      ${options.abhaId ? `<div>ABHA: ${escapeHtml(options.abhaId)}</div>` : ''}
    </div>
  </div>

  <div class="patient-bar">
    <div><span class="label">Patient:</span> <span class="value">${escapeHtml(options.patientName || 'N/A')}</span></div>
    <div><span class="label">Age:</span> <span class="value">${escapeHtml(options.patientAge || 'N/A')}</span></div>
    <div><span class="label">Gender:</span> <span class="value">${escapeHtml(options.patientGender || 'N/A')}</span></div>
    <div><span class="label">Language:</span> <span class="value">${escapeHtml(options.language || 'en')}</span></div>
  </div>

  ${redFlagBlock}

  <div style="font-size: 16px; font-weight: 700; color: #1a388f; margin-bottom: 16px;">Clinical History Summary</div>

  ${sectionsHtml}

  ${ayushBlock}

  <div class="footer">
    MediKiosk - AI-Driven Public Health Chatbot for Disease Awareness | SIH 2026<br/>
    This summary is a draft for physician review. The physician retains full control to accept, amend, or reject.
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.onload = () => {
      setTimeout(() => {
        win.focus()
        win.print()
      }, 500)
    }
  }
}
