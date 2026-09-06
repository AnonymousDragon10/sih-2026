import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Upload, ScanLine, FileText, FlaskConical, ClipboardList, Check, AlertCircle, FilePlus, Trash2, Pill, Download as DownloadIcon } from 'lucide-react'
import { addDocument, getDocuments, saveSummary } from '../lib/api'
import { useAuth } from '../lib/auth'
import { getHisRecords, getPatientRecords, type PatientRecord } from '../lib/authApi'
import { BottleLoader } from '../components/BottleLoader'
import { generatePrescriptionPdf } from '../lib/pdfGenerator'
import type { ClinicalSummary, RedFlag } from '../types'

interface ScannedDoc {
  id: string
  docType: string
  fileName: string
  extractedText: string
  structuredData: Record<string, unknown>
  status: 'processing' | 'completed'
}

export function ScanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [scannedDocs, setScannedDocs] = useState<ScannedDoc[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processingLabel, setProcessingLabel] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState('prescription')
  const [previousRecords, setPreviousRecords] = useState<PatientRecord[]>([])
  const [editingRecord, setEditingRecord] = useState<PatientRecord | null>(null)
  const [editingDraft, setEditingDraft] = useState<ClinicalSummary | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sid = localStorage.getItem('medikiosk_session_id')
    if (sid) {
      setSessionId(sid)
      getDocuments(sid).then((docs) => {
        setScannedDocs(
          docs.map((d) => ({
            id: d.id,
            docType: d.doc_type,
            fileName: d.file_name || 'Unknown',
            extractedText: d.extracted_text || '',
            structuredData: d.structured_data || {},
            status: 'completed' as const,
          }))
        )
      })
    }
    if (user?.role === 'his') getHisRecords(50).then(setPreviousRecords)
    else if (user?.role === 'patient') getPatientRecords(10).then(setPreviousRecords)
    else setPreviousRecords([])
  }, [user])

  const docTypes = [
    { value: 'prescription', label: 'Prescription', icon: FileText, color: 'from-primary-400 to-primary-600' },
    { value: 'lab_report', label: 'Lab Report', icon: FlaskConical, color: 'from-accent-400 to-accent-600' },
    { value: 'discharge_summary', label: 'Discharge Summary', icon: ClipboardList, color: 'from-success-400 to-success-600' },
  ]

  const simulateOCR = (fileName: string, docType: string): { text: string; data: Record<string, unknown> } => {
    const samples: Record<string, { text: string; data: Record<string, unknown> }> = {
      prescription: {
        text: `Dr. R. Sharma, MBBS, MD\nDate: 15/08/2025\n\nPatient: Demo Patient\nAge: 35/M\n\nRx:\n1. Tab. Paracetamol 500mg - 1 tab TID x 5 days\n2. Tab. Azithromycin 500mg - 1 tab OD x 3 days\n3. Cap. Omeprazole 20mg - 1 cap OD before food x 7 days\n4. Syr. Cough Linctus - 2 tsp TID\n\nDiagnosis: Upper Respiratory Tract Infection\nFollow-up: After 5 days`,
        data: {
          diagnoses: ['Upper Respiratory Tract Infection'],
          medications: [
            { name: 'Paracetamol', dosage: '500mg', frequency: 'TID', duration: '5 days' },
            { name: 'Azithromycin', dosage: '500mg', frequency: 'OD', duration: '3 days' },
            { name: 'Omeprazole', dosage: '20mg', frequency: 'OD', duration: '7 days' },
          ],
          follow_up: 'After 5 days',
        },
      },
      lab_report: {
        text: `LAB REPORT - City Diagnostic Centre\nDate: 20/08/2025\n\nPatient: Demo Patient\n\nHemoglobin: 11.2 g/dL (Ref: 13.0-17.0) [LOW]\nWBC: 8,500 /cmm (Ref: 4000-11000) [NORMAL]\nPlatelets: 220,000 /cmm (Ref: 150000-450000) [NORMAL]\nFasting Blood Sugar: 145 mg/dL (Ref: 70-100) [HIGH]\nTotal Cholesterol: 180 mg/dL (Ref: <200) [NORMAL]\n\nImpression: Anemia (mild), Hyperglycemia`,
        data: {
          investigations: [
            { test: 'Hemoglobin', value: '11.2', unit: 'g/dL', ref_range: '13.0-17.0', status: 'LOW' },
            { test: 'WBC', value: '8500', unit: '/cmm', ref_range: '4000-11000', status: 'NORMAL' },
            { test: 'Platelets', value: '220000', unit: '/cmm', ref_range: '150000-450000', status: 'NORMAL' },
            { test: 'Fasting Blood Sugar', value: '145', unit: 'mg/dL', ref_range: '70-100', status: 'HIGH' },
            { test: 'Total Cholesterol', value: '180', unit: 'mg/dL', ref_range: '<200', status: 'NORMAL' },
          ],
          impression: 'Anemia (mild), Hyperglycemia',
          abnormal_values: ['Hemoglobin (LOW)', 'Fasting Blood Sugar (HIGH)'],
        },
      },
      discharge_summary: {
        text: `DISCHARGE SUMMARY - General Hospital\nDate of Admission: 10/08/2025\nDate of Discharge: 14/08/2025\n\nPatient: Demo Patient, 35/M\n\nChief Complaint: Fever and cough for 5 days\nDiagnosis: Community Acquired Pneumonia\nTreatment Given: IV antibiotics, oxygen support, antipyretics\nCondition at Discharge: Stable, afebrile\n\nMedications on Discharge:\n1. Tab. Amoxicillin 500mg TID x 7 days\n2. Tab. Paracetamol 500mg SOS\n3. Tab. Vitamin C 500mg OD\n\nAdvice: Rest, plenty of fluids, follow-up after 1 week`,
        data: {
          admission_date: '10/08/2025',
          discharge_date: '14/08/2025',
          diagnosis: 'Community Acquired Pneumonia',
          treatment: 'IV antibiotics, oxygen support, antipyretics',
          discharge_medications: [
            { name: 'Amoxicillin', dosage: '500mg', frequency: 'TID', duration: '7 days' },
            { name: 'Paracetamol', dosage: '500mg', frequency: 'SOS', duration: 'as needed' },
            { name: 'Vitamin C', dosage: '500mg', frequency: 'OD', duration: 'ongoing' },
          ],
          follow_up: 'After 1 week',
        },
      },
    }

    return samples[docType] || samples.prescription
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !sessionId) return

    setIsProcessing(true)
    setProgress(0)
    setProcessingLabel('Uploading document...')

    const file = files[0]
    const tempId = crypto.randomUUID()

    setProgress(20)
    setProcessingLabel('Running OCR engine...')

    await new Promise((resolve) => setTimeout(resolve, 800))

    setProgress(50)
    setProcessingLabel('Extracting clinical entities...')

    await new Promise((resolve) => setTimeout(resolve, 800))

    setProgress(75)
    setProcessingLabel('Structuring medical data...')

    const { text, data } = simulateOCR(file.name, selectedDocType)

    await new Promise((resolve) => setTimeout(resolve, 600))

    setProgress(90)
    setProcessingLabel('Saving to database...')

    const doc = await addDocument(sessionId, selectedDocType, file.name, text, data)

    setProgress(100)

    setTimeout(() => {
      if (doc) {
        setScannedDocs((prev) => [
          ...prev,
          {
            id: doc.id,
            docType: doc.doc_type,
            fileName: doc.file_name || file.name,
            extractedText: doc.extracted_text || text,
            structuredData: doc.structured_data as Record<string, unknown> || data,
            status: 'completed',
          },
        ])
      }
      setIsProcessing(false)
    }, 500)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const downloadRecord = (record: PatientRecord) => {
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

  const saveEditedRecord = async () => {
    if (!editingRecord || !editingDraft) return
    await saveSummary(editingRecord.session.id, editingDraft as unknown as Record<string, unknown>)
    setPreviousRecords((records) =>
      records.map((record) =>
        record.session.id === editingRecord.session.id
          ? { ...record, summary: { ...record.summary!, summary: editingDraft as unknown as Record<string, unknown> } }
          : record,
      ),
    )
    setEditingRecord(null)
    setEditingDraft(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Document Digitization</h1>
        <p className="text-primary-600">Upload your medical documents for AI-powered OCR and structuring</p>
      </motion.div>

      {/* Document type selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {docTypes.map((dt) => {
          const Icon = dt.icon
          return (
            <button
              key={dt.value}
              onClick={() => setSelectedDocType(dt.value)}
              className={`glass-card p-4 text-center transition-all ${
                selectedDocType === dt.value ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dt.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-primary-700">{dt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`glass-card p-12 text-center mb-6 transition-all ${
          dragActive ? 'ring-2 ring-primary-500 scale-[1.02]' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
        <motion.div
          animate={{ y: dragActive ? -5 : 0 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center mx-auto mb-4"
        >
          <Upload className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="font-display text-lg font-semibold text-primary-800 mb-2">
          Drag & Drop or Click to Upload
        </h3>
        <p className="text-sm text-primary-500 mb-4">
          Supports prescriptions, lab reports, and discharge summaries (JPG, PNG, PDF)
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="glass-button px-6 py-3 inline-flex items-center gap-2"
        >
          <FilePlus size={18} /> Choose File
        </button>
      </div>

      {/* Processing animation */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 mb-6 overflow-hidden"
          >
            <BottleLoader progress={progress} label={processingLabel} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanned documents list */}
      {scannedDocs.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="font-display text-xl font-semibold text-primary-800 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary-500" />
            Digitized Documents ({scannedDocs.length})
          </h2>

          {scannedDocs.map((doc, i) => {
            const docTypeConfig = docTypes.find((dt) => dt.value === doc.docType)
            const Icon = docTypeConfig?.icon || FileText
            const isLabReport = doc.docType === 'lab_report'
            const abnormalValues = isLabReport
              ? (doc.structuredData.abnormal_values as string[]) || []
              : []

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-800">{doc.fileName}</h3>
                    <p className="text-xs text-primary-500 capitalize">{doc.docType.replace('_', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-success-100 text-success-700 text-xs font-medium">
                    <Check size={14} /> Digitized
                  </div>
                </div>

                {/* Extracted text preview */}
                <div className="glass p-3 rounded-xl mb-3">
                  <p className="text-xs text-primary-600 whitespace-pre-line line-clamp-4">{doc.extractedText}</p>
                </div>

                {/* Structured data */}
                <div className="space-y-2">
                  {doc.structuredData.diagnoses ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-primary-500 mt-0.5">Diagnoses:</span>
                      <span className="text-sm text-primary-700">{(doc.structuredData.diagnoses as string[]).join(', ')}</span>
                    </div>
                  ) : null}
                  {doc.structuredData.impression ? (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-primary-500 mt-0.5">Impression:</span>
                      <span className="text-sm text-primary-700">{doc.structuredData.impression as string}</span>
                    </div>
                  ) : null}
                  {doc.structuredData.medications ? (
                    <div>
                      <span className="text-xs font-medium text-primary-500">Medications:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(doc.structuredData.medications as Array<{ name: string; dosage: string; frequency: string }>).map((med, j) => (
                          <div key={j} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-50 text-xs text-primary-700">
                            <Pill size={12} />
                            {med.name} {med.dosage} - {med.frequency}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {isLabReport && abnormalValues.length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-error-50">
                      <AlertCircle size={16} className="text-error-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-error-700">Abnormal Values: </span>
                        <span className="text-xs text-error-600">{abnormalValues.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Previous patient records */}
      <section className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary-800">View Previous Patient&apos;s Records</h2>
            <p className="text-sm text-primary-500">{user?.role === 'his' ? '50 most recent records across all patients.' : user?.role === 'patient' ? 'Your 10 most recent records.' : 'Sign in to view previous records.'}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">{user?.role === 'his' ? 'Last 50' : 'Last 10'}</span>
        </div>
        {previousRecords.length === 0 ? (
          <div className="glass rounded-xl p-5 text-center text-sm text-primary-500">No Records Found</div>
        ) : (
          <div className="space-y-3">
            {previousRecords.map((record) => (
              <div key={record.session.id} className="glass rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-primary-800">{record.patient.name}</h3>
                    {record.redFlags.length > 0 && <span className="px-2 py-0.5 rounded-full bg-error-100 text-error-700 text-xs font-semibold">Red flag</span>}
                  </div>
                  <p className="text-xs text-primary-500 mt-1">{new Date(record.session.created_at).toLocaleString()} · {record.session.mode} · {record.session.language}</p>
                  <p className="text-xs text-primary-600 mt-1">{record.summary ? String((record.summary.summary as Record<string, unknown>).chief_complaint ?? 'Summary available') : 'Summary not generated'}</p>
                </div>
                <div className="flex gap-2">
                  {record.summary && <button onClick={() => { setEditingRecord(record); setEditingDraft(record.summary!.summary as unknown as ClinicalSummary) }} className="glass-button-secondary px-3 py-2 text-xs">Edit summary</button>}
                  {record.summary && <button onClick={() => downloadRecord(record)} className="glass-button px-3 py-2 text-xs flex items-center gap-1"><DownloadIcon /> Download PDF</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editingRecord && editingDraft && (
        <div className="glass-card p-6 mb-6 border-2 border-primary-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-primary-800">Edit Summary: {editingRecord.patient.name}</h2>
              <p className="text-xs text-primary-500">Changes are saved to this patient record and included in the downloadable prescription.</p>
            </div>
            <button onClick={() => { setEditingRecord(null); setEditingDraft(null) }} className="glass-button-secondary px-3 py-2 text-sm">Close</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(editingDraft).filter(([key]) => key !== 'ayush_assessment').map(([key, value]) => (
              <label key={key} className="text-xs font-semibold text-primary-700 capitalize">
                {key.replace(/_/g, ' ')}
                <textarea value={String(value)} onChange={(event) => setEditingDraft({ ...editingDraft, [key]: event.target.value })} className="glass-input w-full mt-1 px-3 py-2 text-sm font-normal min-h-[86px]" />
              </label>
            ))}
          </div>
          <button onClick={saveEditedRecord} className="glass-button px-5 py-3 mt-4 flex items-center gap-2"><Check size={16} /> Save edited summary</button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => navigate('/chat')}
          className="glass-button-secondary px-6 py-3"
        >
          Back to Chat
        </button>
        <button
          onClick={() => navigate('/summary')}
          className="glass-button px-6 py-3 flex items-center gap-2"
        >
          <FileText size={18} /> View Summary
        </button>
      </div>
    </div>
  )
}
