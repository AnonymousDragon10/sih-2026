import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Languages, Check, ArrowRight, Activity, Shield, FileText, ScanLine, MessageSquare } from 'lucide-react'
import { createPatient, createSession } from '../lib/api'
import { LANGUAGES, type Language } from '../types'
import { BottleLoader } from '../components/BottleLoader'

export function IdentifyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'identity' | 'language' | 'consent' | 'creating'>('identity')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [abhaId, setAbhaId] = useState('')
  const [language, setLanguage] = useState<Language>('en')
  const [mode, setMode] = useState<'allopathic' | 'ayush'>('allopathic')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  const handleStart = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setStep('creating')
    setProgress(10)

    const patient = await createPatient({
      name: name.trim(),
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      phone: phone || undefined,
      abha_id: abhaId || undefined,
      language,
    })

    if (!patient) {
      setError('Failed to register patient. Please try again.')
      setStep('identity')
      return
    }

    setProgress(40)

    const session = await createSession(patient.id, mode, language)

    if (!session) {
      setError('Failed to create session. Please try again.')
      setStep('identity')
      return
    }

    setProgress(70)

    localStorage.setItem('medikiosk_session_id', session.id)
    localStorage.setItem('medikiosk_patient_id', patient.id)
    localStorage.setItem('medikiosk_patient_name', patient.name)
    localStorage.setItem('medikiosk_mode', mode)
    localStorage.setItem('medikiosk_language', language)

    setProgress(100)

    setTimeout(() => {
      navigate('/chat')
    }, 800)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Patient Identification</h1>
        <p className="text-primary-600">Step 1 of the MediKiosk journey - Register and grant consent</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'identity' && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-primary-800">Your Details</h2>
                <p className="text-sm text-primary-500">Enter your information to begin</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="glass-input w-full px-4 py-3 text-primary-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    className="glass-input w-full px-4 py-3 text-primary-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="glass-input w-full px-4 py-3 text-primary-800"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="glass-input w-full px-4 py-3 text-primary-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1.5">ABHA ID (Ayushman Bharat Health Account)</label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="Enter ABHA ID (optional)"
                  className="glass-input w-full px-4 py-3 text-primary-800"
                />
                <p className="text-xs text-primary-400 mt-1">Link your digital health record for seamless integration</p>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-error-500 text-sm mt-4"
              >
                {error}
              </motion.p>
            )}

            <button
              onClick={() => setStep('language')}
              disabled={!name.trim()}
              className="glass-button w-full mt-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-primary-800">Select Language</h2>
                <p className="text-sm text-primary-500">Choose your preferred language for the interview</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    language === lang.code
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-transparent glass'
                  }`}
                >
                  <div className="font-display font-semibold text-primary-800">{lang.native}</div>
                  <div className="text-xs text-primary-500">{lang.label}</div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-display font-semibold text-primary-800 mb-3">Consultation Mode</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('allopathic')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    mode === 'allopathic'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-transparent glass'
                  }`}
                >
                  <Activity className="w-5 h-5 text-primary-500" />
                  <div className="text-left">
                    <div className="font-semibold text-primary-800 text-sm">Allopathic</div>
                    <div className="text-xs text-primary-500">Standard medical history</div>
                  </div>
                </button>
                <button
                  onClick={() => setMode('ayush')}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    mode === 'ayush'
                      ? 'border-warning-500 bg-warning-50'
                      : 'border-transparent glass'
                  }`}
                >
                  <Shield className="w-5 h-5 text-warning-500" />
                  <div className="text-left">
                    <div className="font-semibold text-primary-800 text-sm">AYUSH</div>
                    <div className="text-xs text-primary-500">Ayurvedic assessment</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('identity')}
                className="glass-button-secondary px-6 py-3"
              >
                Back
              </button>
              <button
                onClick={() => setStep('consent')}
                className="glass-button flex-1 py-3 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'consent' && (
          <motion.div
            key="consent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-primary-800">Consent & Privacy</h2>
                <p className="text-sm text-primary-500">Grant consent for data capture and sharing</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: MessageSquare, text: 'I consent to AI-driven voice and text history taking', checked: true },
                { icon: ScanLine, text: 'I consent to digitization of my medical documents via OCR', checked: true },
                { icon: FileText, text: 'I consent to sharing my structured summary with the treating physician', checked: true },
                { icon: Shield, text: 'I understand my data is processed securely per DPDP Act 2023', checked: true },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="glass p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-success-600" />
                    </div>
                    <span className="text-sm text-primary-700 flex-1">{item.text}</span>
                    <Check className="w-5 h-5 text-success-500" />
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-primary-400 mt-4">
              Your session data will be cleared after consultation. You can revoke consent at any time.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('language')}
                className="glass-button-secondary px-6 py-3"
              >
                Back
              </button>
              <button
                onClick={handleStart}
                className="glass-button flex-1 py-3 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Grant Consent & Start
              </button>
            </div>
          </motion.div>
        )}

        {step === 'creating' && (
          <motion.div
            key="creating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12"
          >
            <BottleLoader progress={progress} label="Setting up your session..." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
