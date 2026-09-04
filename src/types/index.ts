export interface Patient {
  id: string
  abha_id: string | null
  name: string
  age: number | null
  gender: string | null
  phone: string | null
  language: string
  created_at: string
}

export interface Session {
  id: string
  patient_id: string
  status: string
  language: string
  consent_given: boolean
  mode: string
  red_flag_triggered: boolean
  created_at: string
  completed_at: string | null
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  mode: string
  question_type: string | null
  created_at: string
}

export interface Document {
  id: string
  session_id: string
  doc_type: string
  file_name: string | null
  extracted_text: string | null
  structured_data: Record<string, unknown> | null
  created_at: string
}

export interface Summary {
  id: string
  session_id: string
  summary: ClinicalSummary
  created_at: string
}

export interface ClinicalSummary {
  chief_complaint: string
  hpi: string
  past_medical_history: string
  drug_allergy_history: string
  family_history: string
  personal_history: string
  review_of_systems: string
  prior_investigations: string
  ayush_assessment?: AyushAssessment
}

export interface AyushAssessment {
  prakriti: string
  vikriti: string
  agni: string
  koshtha: string
  sara: string
  samhanana: string
  pramana: string
  satmya: string
  sattva: string
  ahara_shakti: string
  vyayama_shakti: string
  vaya: string
}

export interface RedFlag {
  id: string
  session_id: string
  flag_type: string
  severity: string
  description: string
  created_at: string
}

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'gu' | 'pa' | 'ml'

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
]
