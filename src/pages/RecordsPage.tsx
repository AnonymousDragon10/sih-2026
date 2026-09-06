import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Edit, FileText, Save, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { callCleanupHisRecords, callCleanupPatientRecords, getHisRecords, getPatientRecords, updateSummary, type PatientRecord } from '../lib/authApi'
import { generatePrescriptionPdf } from '../lib/pdfGenerator'
import type { ClinicalSummary, RedFlag } from '../types'

export function RecordsPage({ his = false }: { his?: boolean }) {
  const { user } = useAuth()
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [editing, setEditing] = useState<PatientRecord | null>(null)
  const [draft, setDraft] = useState<ClinicalSummary | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user || (his && user.role !== 'his') || (!his && user.role !== 'patient')) {
        setRecords([])
        return
      }
      if (his) await callCleanupHisRecords()
      else await callCleanupPatientRecords()
      setRecords(his ? await getHisRecords(50) : await getPatientRecords(10))
    }
    void load()
  }, [his, user])

  const download = (record: PatientRecord) => {
    if (!record.summary) return
    void generatePrescriptionPdf(record.summary.summary as unknown as ClinicalSummary, record.redFlags as unknown as RedFlag[], {
      patientName: record.patient.name,
      patientAge: record.patient.age ? String(record.patient.age) : undefined,
      patientGender: record.patient.gender || undefined,
      abhaId: record.patient.abha_id || undefined,
      language: record.session.language,
      mode: record.session.mode,
    })
  }

  const save = async () => {
    if (!editing?.summary || !draft) return
    const ok = await updateSummary(editing.summary.id, draft as unknown as Record<string, unknown>)
    if (ok) setRecords((items) => items.map((item) => item.session.id === editing.session.id ? { ...item, summary: { ...item.summary!, summary: draft as unknown as Record<string, unknown> } } : item))
    setEditing(null)
    setDraft(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">{his ? 'Clinical operations' : 'Your health history'}</p>
        <h1 className="font-display text-3xl font-bold text-primary-800">{his ? 'HIS patient records' : 'My records'}</h1>
        <p className="text-primary-600 mt-2">{his ? 'Review the 50 most recent completed patient histories.' : 'Your 10 most recent consultation summaries are kept safely here.'}</p>
      </motion.div>

      {editing && draft && (
        <div className="glass-card p-6 mb-6 border-2 border-primary-300">
          <div className="flex justify-between gap-4 mb-4">
            <div><h2 className="font-display text-xl font-semibold text-primary-800">Edit summary</h2><p className="text-sm text-primary-500">{editing.patient.name}</p></div>
            <button onClick={() => setEditing(null)} className="glass-button-secondary px-3 py-2 text-sm">Close</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(draft).filter(([key]) => key !== 'ayush_assessment').map(([key, value]) => (
              <label key={key} className="text-xs font-semibold text-primary-700 capitalize">{key.replace(/_/g, ' ')}
                <textarea value={String(value)} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="glass-input w-full mt-1 px-3 py-2 min-h-24 font-normal" />
              </label>
            ))}
          </div>
          <button onClick={save} className="glass-button px-5 py-3 mt-4 flex items-center gap-2"><Save size={16} /> Save changes</button>
        </div>
      )}

      {records.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <FileText className="w-12 h-12 mx-auto text-primary-300 mb-3" />
          <h2 className="font-semibold text-primary-800">No saved summaries yet</h2>
          <p className="text-sm text-primary-600 mt-2">No Records Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.session.id} className="glass-card p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-primary-800">{record.patient.name || 'Patient'}</h2>
                    {record.redFlags.length > 0 && <span className="rounded-full bg-error-100 px-2 py-1 text-xs font-semibold text-error-700">Red flag</span>}
                  </div>
                  <p className="text-xs text-primary-500 mt-1">{new Date(record.session.created_at).toLocaleString()} · {record.session.mode} · {record.session.language}</p>
                  <p className="text-sm text-primary-600 mt-2">{(record.summary?.summary as Record<string, unknown> | undefined)?.chief_complaint as string || 'Summary not generated'}</p>
                </div>
                <div className="flex gap-2">
                  {record.summary && <button onClick={() => { setEditing(record); setDraft(record.summary!.summary as unknown as ClinicalSummary) }} className="glass-button-secondary px-3 py-2 text-sm flex gap-1 items-center"><Edit size={15} /> Edit</button>}
                  {record.summary && <button onClick={() => download(record)} className="glass-button px-3 py-2 text-sm flex gap-1 items-center"><Download size={15} /> PDF</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {his && <p className="text-xs text-primary-500 mt-5 flex gap-2 items-center"><AlertCircle size={14} /> Patient records are visible to authorized HIS staff for clinical review.</p>}
    </div>
  )
}
