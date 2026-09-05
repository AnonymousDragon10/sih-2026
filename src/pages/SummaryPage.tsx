import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FileText, Check, Edit, Save, Download, AlertCircle, Stethoscope, Pill, FlaskConical, ClipboardList, Activity } from 'lucide-react'
import { getChatMessages, getDocuments, saveSummary, getSummary, getRedFlags, completeSession } from '../lib/api'
import { generateSummary } from '../lib/clinicalEngine'
import { BottleLoader } from '../components/BottleLoader'
import type { ClinicalSummary, RedFlag } from '../types'
import { generatePrescriptionPdf } from '../lib/pdfGenerator'

export function SummaryPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<ClinicalSummary | null>(null)
  const [editing, setEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState<ClinicalSummary | null>(null)
  const [redFlags, setRedFlags] = useState<RedFlag[]>([])
  const [saved, setSaved] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const sid = localStorage.getItem('medikiosk_session_id')
    const mode = localStorage.getItem('medikiosk_mode') as 'allopathic' | 'ayush' | null

    if (!sid) {
      setLoading(false)
      return
    }

    setSessionId(sid)

    const loadSummary = async () => {
      setProgress(15)

      const [existingSummary, flags] = await Promise.all([getSummary(sid), getRedFlags(sid)])
      setRedFlags(flags)
      setProgress(30)

      if (existingSummary) {
        setSummary(existingSummary.summary as ClinicalSummary)
        setEditedSummary(existingSummary.summary as ClinicalSummary)
        setProgress(100)
        setLoading(false)
        return
      }

      const messages = await getChatMessages(sid)
      setProgress(50)

      const answers: Record<string, string> = {}
      messages.forEach((msg) => {
        if (msg.role === 'user' && msg.question_type) {
          answers[msg.question_type] = msg.content
        }
      })

      setProgress(70)

      const generated = generateSummary(answers, mode || 'allopathic')
      setSummary(generated)
      setEditedSummary(generated)

      setProgress(85)
      await saveSummary(sid, generated as unknown as Record<string, unknown>)
      setProgress(100)

      setTimeout(() => setLoading(false), 500)
    }

    loadSummary()
  }, [])

  const handleSave = async () => {
    if (!sessionId || !editedSummary) return
    setSummary(editedSummary)
    await saveSummary(sessionId, editedSummary as unknown as Record<string, unknown>)
    await completeSession(sessionId)
    setEditing(false)
    setSaved(true)
    generatePrescriptionPdf(editedSummary, redFlags, {
      patientName: localStorage.getItem('medikiosk_patient_name') || 'Patient',
      language: localStorage.getItem('medikiosk_language') || 'en',
      mode: localStorage.getItem('medikiosk_mode') || 'allopathic',
    })
    setTimeout(() => setSaved(false), 3000)
  }

  const downloadSummary = () => {
    if (!summary) return
    generatePrescriptionPdf(summary, redFlags, {
      patientName: localStorage.getItem('medikiosk_patient_name') || 'Patient',
      language: localStorage.getItem('medikiosk_language') || 'en',
      mode: localStorage.getItem('medikiosk_mode') || 'allopathic',
    })
  }

  const summarySections = [
    { key: 'chief_complaint', label: 'Chief Complaint', icon: AlertCircle },
    { key: 'hpi', label: 'History of Present Illness', icon: Activity },
    { key: 'past_medical_history', label: 'Past Medical / Surgical History', icon: ClipboardList },
    { key: 'drug_allergy_history', label: 'Drug & Allergy History', icon: Pill },
    { key: 'family_history', label: 'Family History', icon: Stethoscope },
    { key: 'personal_history', label: 'Personal History', icon: FileText },
    { key: 'review_of_systems', label: 'Review of Systems', icon: FlaskConical },
    { key: 'prior_investigations', label: 'Prior Investigations', icon: FlaskConical },
  ]

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card p-12">
          <BottleLoader progress={progress} label="Generating your clinical summary..." />
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card p-8 text-center">
          <AlertCircle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-primary-800 mb-2">No Summary Available</h2>
          <p className="text-sm text-primary-600 mb-4">Please complete the clinical interview first.</p>
          <button onClick={() => navigate('/chat')} className="glass-button px-6 py-3">
            Start Interview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Clinical History Summary</h1>
        <p className="text-primary-600">Physician-ready structured history - editable and verifiable</p>
      </motion.div>

      {/* Red flags */}
      {redFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 mb-6 border-2 border-error-400 bg-error-50"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-error-500" />
            <div>
              <h3 className="font-semibold text-error-700">Red Flags Detected ({redFlags.length})</h3>
              {redFlags.map((flag, i) => (
                <p key={i} className="text-sm text-error-600">{flag.description}</p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-primary-800">Structured Summary</h2>
              <p className="text-xs text-primary-500">Generated by AI - physician can edit and confirm</p>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={() => {
                    setEditing(false)
                    setEditedSummary(summary)
                  }}
                  className="glass-button-secondary px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="glass-button px-4 py-2 text-sm flex items-center gap-1"
                >
                  <Save size={16} /> Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="glass-button-secondary px-4 py-2 text-sm flex items-center gap-1"
              >
                <Edit size={16} /> Edit
              </button>
            )}
          </div>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 rounded-xl bg-success-100 text-success-700 text-sm flex items-center gap-2"
          >
            <Check size={18} /> Summary saved and session completed!
          </motion.div>
        )}

        {/* Summary sections */}
        <div className="space-y-4">
          {summarySections.map((section) => {
            const Icon = section.icon
            const value = (summary as any)[section.key] as string
            const editedValue = (editedSummary as any)?.[section.key] as string

            return (
              <div key={section.key} className="glass p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-primary-700 mb-1">{section.label}</h3>
                    {editing ? (
                      <textarea
                        value={editedValue}
                        onChange={(e) =>
                          setEditedSummary({
                            ...editedSummary!,
                            [section.key]: e.target.value,
                          })
                        }
                        className="glass-input w-full px-3 py-2 text-sm text-primary-800 min-h-[80px]"
                      />
                    ) : (
                      <p className="text-sm text-primary-600 whitespace-pre-line">{value || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* AYUSH assessment */}
          {summary.ayush_assessment && (
            <div className="glass p-4 rounded-xl border-2 border-warning-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-warning-600" />
                </div>
                <h3 className="text-sm font-semibold text-warning-700">AYUSH Assessment - Dashavidha Pariksha</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(summary.ayush_assessment).map(([key, value]) => (
                  <div key={key} className="bg-warning-50 p-2 rounded-lg">
                    <span className="text-xs font-medium text-warning-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <p className="text-sm text-warning-800">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/scan')}
          className="glass-button-secondary px-6 py-3 flex items-center gap-2"
        >
          <FileText size={18} /> Scan Documents
        </button>
        <button
          onClick={handleSave}
          className="glass-button px-6 py-3 flex items-center gap-2"
        >
          <Download size={18} /> Confirm & Download PDF
        </button>
      </div>

      <button onClick={downloadSummary} className="mx-auto mt-4 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 transition-colors">
        <Download size={16} /> Download prescription PDF again
      </button>

      <p className="text-center text-xs text-primary-400 mt-4">
        This summary is a draft for physician review. The physician retains full control to accept, amend, or reject.
      </p>
    </div>
  )
}
