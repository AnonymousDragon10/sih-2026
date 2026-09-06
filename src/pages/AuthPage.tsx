import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Activity, LockKeyhole, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react'
import { loginHisUser, loginPatient, registerHisUser, registerPatient } from '../lib/authApi'

export function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialRole = params.get('role') === 'his' ? 'his' : 'patient'
  const [role, setRole] = useState<'patient' | 'his'>(initialRole)
  const [isRegistering, setIsRegistering] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [aadhaarId, setAadhaarId] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    if (!identifier.trim() || !password) return setError('Please enter your login details.')
    if (isRegistering && !name.trim()) return setError('Please enter your full name.')
    if (password.length < 6) return setError('Password must contain at least 6 characters.')
    setBusy(true)
    const result = role === 'patient'
      ? isRegistering
        ? await registerPatient({ abhaId: identifier.trim(), aadhaarId: aadhaarId.trim() || undefined, name: name.trim(), age: age ? Number(age) : undefined, gender: gender || undefined, phone: phone.trim() || undefined, password })
        : await loginPatient(identifier.trim(), password)
      : isRegistering
        ? await registerHisUser({ username: identifier.trim(), displayName: name.trim(), password })
        : await loginHisUser(identifier.trim(), password)
    setBusy(false)
    if (result.error) return setError(result.error)
    navigate('/records')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-7 md:p-9">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            {role === 'his' ? <ShieldCheck className="text-white" /> : <Activity className="text-white" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">MediKiosk secure access</p>
            <h1 className="font-display text-2xl font-bold text-primary-800">{role === 'his' ? 'Hospital Information System' : 'Patient account'}</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl glass mb-6">
          <button onClick={() => { setRole('patient'); setError('') }} className={`py-2 rounded-lg text-sm font-semibold ${role === 'patient' ? 'bg-primary-500 text-white' : 'text-primary-600'}`}>Patient Mode</button>
          <button onClick={() => { setRole('his'); setError('') }} className={`py-2 rounded-lg text-sm font-semibold ${role === 'his' ? 'bg-primary-500 text-white' : 'text-primary-600'}`}>HIS Mode</button>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <LockKeyhole size={17} className="text-primary-500" />
          <h2 className="font-semibold text-primary-800">{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-primary-700">{role === 'his' ? 'Username' : 'ABHA ID'}
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5" placeholder={role === 'his' ? 'e.g. city_hospital' : 'Enter your ABHA ID'} />
          </label>
          {isRegistering && <>
            <label className="block text-sm font-medium text-primary-700">Full name
              <input value={name} onChange={(e) => setName(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5" placeholder="Enter full name" />
            </label>
            {role === 'patient' && <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-primary-700">Age<input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5" /></label>
              <label className="block text-sm font-medium text-primary-700">Gender<select value={gender} onChange={(e) => setGender(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5"><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></label>
            </div>}
            {role === 'patient' && <label className="block text-sm font-medium text-primary-700">Aadhaar ID <span className="font-normal text-primary-400">(use ABHA ID or Aadhaar)</span><input value={aadhaarId} onChange={(e) => setAadhaarId(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5" placeholder="Optional if ABHA ID is provided" /></label>}
            {role === 'patient' && <label className="block text-sm font-medium text-primary-700">Phone <span className="font-normal text-primary-400">(optional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5" /></label>}
          </>}
          <label className="block text-sm font-medium text-primary-700">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full px-4 py-3 mt-1.5" placeholder="At least 6 characters" /></label>
        </div>
        {error && <p className="mt-4 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-700">{error}</p>}
        <button onClick={submit} disabled={busy} className="glass-button w-full py-3 mt-6 flex items-center justify-center gap-2 disabled:opacity-60">{busy ? 'Please wait...' : isRegistering ? 'Create account' : 'Sign in'} {!busy && <ArrowRight size={18} />}</button>
        <button onClick={() => { setIsRegistering(!isRegistering); setError('') }} className="w-full mt-4 text-sm text-primary-600 hover:text-primary-800 flex items-center justify-center gap-2"><UserPlus size={16} />{isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
      </motion.div>
    </div>
  )
}
