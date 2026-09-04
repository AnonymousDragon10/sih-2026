import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Check, Lock, FileText, Volume2, Eye, Trash2, Download, KeyRound, Heart, AlertCircle } from 'lucide-react'

export function ConsentPage() {
  const navigate = useNavigate()
  const [consents, setConsents] = useState({
    historyCapture: true,
    documentDigitization: true,
    physicianSharing: true,
    abdmLinkage: false,
    dataRetention: true,
  })
  const [showRevoke, setShowRevoke] = useState(false)

  const consentItems = [
    {
      key: 'historyCapture',
      icon: Volume2,
      title: 'AI History Capture',
      description: 'I consent to AI-driven voice and text-based clinical history taking. My responses will be processed securely to generate a structured medical history.',
      required: true,
    },
    {
      key: 'documentDigitization',
      icon: FileText,
      title: 'Document Digitization',
      description: 'I consent to OCR processing of my uploaded medical documents (prescriptions, lab reports, discharge summaries) for clinical entity extraction.',
      required: true,
    },
    {
      key: 'physicianSharing',
      icon: Eye,
      title: 'Physician Access',
      description: 'I consent to sharing my structured clinical summary with the treating physician for consultation purposes.',
      required: true,
    },
    {
      key: 'abdmLinkage',
      icon: KeyRound,
      title: 'ABDM Integration (Optional)',
      description: 'I consent to linking my health data with my ABHA ID and the Ayushman Bharat Digital Mission ecosystem via FHIR APIs.',
      required: false,
    },
    {
      key: 'dataRetention',
      icon: Lock,
      title: 'Data Processing & Security',
      description: 'I understand my health data is processed securely per the Digital Personal Data Protection Act 2023. Session data is cleared after consultation.',
      required: true,
    },
  ]

  const toggleConsent = (key: string) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const allRequired = consentItems
    .filter((item) => item.required)
    .every((item) => consents[item.key as keyof typeof consents])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
          <Shield className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-primary-700">Consent & Privacy Layer</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Your Privacy, Your Control</h1>
        <p className="text-primary-600">Granular, revocable consent compliant with DPDP Act 2023 & ABDM framework</p>
      </motion.div>

      {/* Consent items */}
      <div className="space-y-4 mb-6">
        {consentItems.map((item, i) => {
          const Icon = item.icon
          const isGranted = consents[item.key as keyof typeof consents]
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-5 ${isGranted ? '' : 'opacity-75'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isGranted ? 'bg-gradient-to-br from-success-400 to-success-600' : 'glass'
                }`}>
                  <Icon className={`w-6 h-6 ${isGranted ? 'text-white' : 'text-primary-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-primary-800">{item.title}</h3>
                    {item.required ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-error-100 text-error-600 font-medium">Required</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 font-medium">Optional</span>
                    )}
                  </div>
                  <p className="text-sm text-primary-600 mb-3">{item.description}</p>
                  <button
                    onClick={() => toggleConsent(item.key)}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      isGranted ? 'bg-success-500' : 'bg-primary-200'
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                      style={{ left: isGranted ? '32px' : '4px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                  <span className={`ml-3 text-xs font-medium ${isGranted ? 'text-success-600' : 'text-primary-400'}`}>
                    {isGranted ? 'Granted' : 'Not Granted'}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Privacy features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 mb-6"
      >
        <h2 className="font-display text-lg font-semibold text-primary-800 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-500" />
          Security & Privacy Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Lock, title: 'Secure Processing', desc: 'Voice and document AI processed within secure platform' },
            { icon: Trash2, title: 'Session Termination', desc: 'Temporary session data cleared after submission' },
            { icon: Volume2, title: 'Audio-Guided Consent', desc: 'Consent explained via audio for low-literacy patients' },
            { icon: KeyRound, title: 'ABHA Integration', desc: 'Link to Ayushman Bharat Health Account via FHIR APIs' },
            { icon: Eye, title: 'Granular Control', desc: 'Individual consent toggles for each data type' },
            { icon: Download, title: 'Data Portability', desc: 'Export your health data in standard FHIR format' },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="glass p-3 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-700">{feature.title}</h3>
                  <p className="text-xs text-primary-500">{feature.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Revoke consent */}
      <AnimatePresence>
        {showRevoke && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 mb-6 border-2 border-error-400"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-error-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-error-700">Revoke All Consent</h3>
                <p className="text-sm text-error-600 mt-1">
                  This will immediately stop all data processing and clear your session data.
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      localStorage.clear()
                      navigate('/')
                    }}
                    className="bg-error-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-error-600 transition-all"
                  >
                    Yes, Revoke Everything
                  </button>
                  <button
                    onClick={() => setShowRevoke(false)}
                    className="glass-button-secondary px-6 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => setShowRevoke(!showRevoke)}
          className="glass-button-secondary px-6 py-3 flex items-center justify-center gap-2"
        >
          <Trash2 size={18} /> Revoke Consent
        </button>
        <button
          onClick={() => navigate('/summary')}
          disabled={!allRequired}
          className="glass-button px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check size={18} /> Confirm & Continue
        </button>
      </div>

      {!allRequired && (
        <p className="text-center text-xs text-error-500 mt-3">
          All required consents must be granted to continue.
        </p>
      )}

      <div className="flex items-center justify-center gap-2 mt-8 text-primary-400">
        <Heart size={16} />
        <span className="text-xs">Your health data is protected with industry-standard encryption and security protocols</span>
      </div>
    </div>
  )
}
