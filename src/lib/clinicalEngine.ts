import type { ClinicalSummary, AyushAssessment } from '../types'

export interface QuestionOption {
  label: string
  value: string
}

export interface InterviewQuestion {
  id: string
  category: string
  question: string
  questionHindi?: string
  options?: QuestionOption[]
  isFreeText?: boolean
  followUp?: (answer: string) => InterviewQuestion | null
  redFlagCheck?: (answer: string) => RedFlagResult | null
}

export interface RedFlagResult {
  flagType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface ConversationState {
  currentQuestionIndex: number
  answers: Record<string, string>
  history: { question: string; answer: string; category: string }[]
  mode: 'allopathic' | 'ayush'
}

export const chiefComplaintOptions: QuestionOption[] = [
  { label: 'Fever', value: 'fever' },
  { label: 'Chest Pain', value: 'chest_pain' },
  { label: 'Headache', value: 'headache' },
  { label: 'Abdominal Pain', value: 'abdominal_pain' },
  { label: 'Cough / Breathing Difficulty', value: 'respiratory' },
  { label: 'Joint / Body Pain', value: 'joint_pain' },
  { label: 'Weakness / Fatigue', value: 'fatigue' },
  { label: 'Skin Problem', value: 'skin' },
  { label: 'Digestive Issues', value: 'digestive' },
  { label: 'Other', value: 'other' },
]

export const redFlagKeywords: Record<string, RedFlagResult> = {
  'chest pain': {
    flagType: 'cardiac',
    severity: 'critical',
    description: 'Chest pain reported - potential cardiac emergency. Immediate triage recommended.',
  },
  'breathing difficulty': {
    flagType: 'respiratory',
    severity: 'critical',
    description: 'Breathing difficulty - potential respiratory emergency. Immediate triage recommended.',
  },
  'stroke': {
    flagType: 'neurological',
    severity: 'critical',
    description: 'Stroke symptoms reported - immediate medical attention required.',
  },
  'unconscious': {
    flagType: 'neurological',
    severity: 'critical',
    description: 'Unconsciousness reported - critical emergency.',
  },
  'severe bleeding': {
    flagType: 'hemorrhage',
    severity: 'critical',
    description: 'Severe bleeding reported - immediate hemostasis required.',
  },
  'suicidal': {
    flagType: 'psychiatric',
    severity: 'critical',
    description: 'Suicidal ideation reported - immediate psychiatric intervention required.',
  },
}

export function checkRedFlags(text: string): RedFlagResult | null {
  const lower = text.toLowerCase()
  for (const [keyword, flag] of Object.entries(redFlagKeywords)) {
    if (lower.includes(keyword)) {
      return flag
    }
  }
  return null
}

export const allopathicQuestions: InterviewQuestion[] = [
  {
    id: 'chief_complaint',
    category: 'Chief Complaint',
    question: 'What is your main problem or complaint today?',
    questionHindi: 'आज आपकी मुख्य समस्या क्या है?',
    options: chiefComplaintOptions,
  },
  {
    id: 'hpi_onset',
    category: 'History of Present Illness',
    question: 'When did this problem start?',
    questionHindi: 'यह समस्या कब शुरू हुई?',
    isFreeText: true,
  },
  {
    id: 'hpi_duration',
    category: 'History of Present Illness',
    question: 'How long have you had this problem?',
    questionHindi: 'आपको यह समस्या कितने समय से है?',
    options: [
      { label: 'Less than a day', value: 'acute' },
      { label: '1-3 days', value: 'subacute' },
      { label: '3-7 days', value: 'subacute' },
      { label: '1-2 weeks', value: 'subacute' },
      { label: 'More than 2 weeks', value: 'chronic' },
      { label: 'More than a month', value: 'chronic' },
    ],
  },
  {
    id: 'hpi_severity',
    category: 'History of Present Illness',
    question: 'How severe is your problem? (Rate from 1-10)',
    questionHindi: 'आपकी समस्या कितनी गंभीर है? (1-10 में रेट करें)',
    options: [
      { label: 'Mild (1-3)', value: 'mild' },
      { label: 'Moderate (4-6)', value: 'moderate' },
      { label: 'Severe (7-8)', value: 'severe' },
      { label: 'Very Severe (9-10)', value: 'very_severe' },
    ],
    redFlagCheck: (answer: string) => {
      if (answer === 'very_severe') {
        return {
          flagType: 'severe_symptom',
          severity: 'high',
          description: 'Very severe symptom rating reported - priority triage recommended.',
        }
      }
      return null
    },
  },
  {
    id: 'hpi_associated',
    category: 'History of Present Illness',
    question: 'Do you have any other symptoms along with this?',
    questionHindi: 'क्या इसके साथ कोई अन्य लक्षण भी हैं?',
    isFreeText: true,
  },
  {
    id: 'past_medical',
    category: 'Past Medical History',
    question: 'Do you have any past medical conditions? (e.g., diabetes, hypertension, asthma)',
    questionHindi: 'क्या आपको कोई पुरानी बीमारी है? (जैसे मधुमेह, उच्च रक्तचाप, अस्थमा)',
    isFreeText: true,
  },
  {
    id: 'past_surgical',
    category: 'Past Surgical History',
    question: 'Have you had any surgeries in the past?',
    questionHindi: 'क्या आपने पहले कोई सर्जरी करवाई है?',
    isFreeText: true,
  },
  {
    id: 'drug_allergy',
    category: 'Drug & Allergy History',
    question: 'Are you allergic to any medicines or foods?',
    questionHindi: 'क्या आपको किसी दवा या खाद्य पदार्थ से एलर्जी है?',
    options: [
      { label: 'No known allergies', value: 'none' },
      { label: 'Penicillin', value: 'penicillin' },
      { label: 'Sulfa drugs', value: 'sulfa' },
      { label: 'Aspirin / NSAIDs', value: 'nsaid' },
      { label: 'Other (please specify)', value: 'other' },
    ],
  },
  {
    id: 'current_medication',
    category: 'Drug & Allergy History',
    question: 'Are you currently taking any medicines?',
    questionHindi: 'क्या आप वर्तमान में कोई दवा ले रहे हैं?',
    isFreeText: true,
  },
  {
    id: 'family_history',
    category: 'Family History',
    question: 'Does anyone in your family have major illnesses? (e.g., diabetes, heart disease, cancer)',
    questionHindi: 'क्या आपके परिवार में किसी को बड़ी बीमारी है?',
    isFreeText: true,
  },
  {
    id: 'personal_history',
    category: 'Personal History',
    question: 'Do you smoke, consume alcohol, or use tobacco?',
    questionHindi: 'क्या आप धूम्रपान, शराब या तंबाकू का सेवन करते हैं?',
    options: [
      { label: 'No', value: 'none' },
      { label: 'Smoking', value: 'smoking' },
      { label: 'Alcohol', value: 'alcohol' },
      { label: 'Tobacco', value: 'tobacco' },
      { label: 'Multiple', value: 'multiple' },
    ],
  },
  {
    id: 'ros_general',
    category: 'Review of Systems',
    question: 'Have you noticed any weight loss, loss of appetite, or fever recently?',
    questionHindi: 'क्या हाल ही में वजन घटना, भूख न लगना, या बुखार हुआ है?',
    isFreeText: true,
  },
]

export const ayushQuestions: InterviewQuestion[] = [
  {
    id: 'prakriti',
    category: 'Dashavidha Pariksha - Prakriti',
    question: 'What is your body constitution type (Prakriti)?',
    questionHindi: 'आपकी प्रकृति (शरीर संविधान) क्या है?',
    options: [
      { label: 'Vata (thin, energetic, dry skin)', value: 'vata' },
      { label: 'Pitta (medium build, sharp, warm)', value: 'pitta' },
      { label: 'Kapha (sturdy, calm, oily skin)', value: 'kapha' },
      { label: 'Vata-Pitta', value: 'vata_pitta' },
      { label: 'Pitta-Kapha', value: 'pitta_kapha' },
      { label: 'Vata-Kapha', value: 'vata_kapha' },
      { label: 'Tridoshic (balanced)', value: 'tridoshic' },
    ],
  },
  {
    id: 'vikriti',
    category: 'Dashavidha Pariksha - Vikriti',
    question: 'What is your current imbalance (Vikriti)? What symptoms bother you most?',
    questionHindi: 'आपकी विकृति (वर्तमान असंतुलन) क्या है?',
    isFreeText: true,
  },
  {
    id: 'agni',
    category: 'Dashavidha Pariksha - Agni',
    question: 'How is your digestive fire (Agni)?',
    questionHindi: 'आपकी अग्नि (पाचन शक्ति) कैसी है?',
    options: [
      { label: 'Strong (sharp hunger, good digestion)', value: 'teekshna' },
      { label: 'Moderate (normal hunger)', value: 'sama' },
      { label: 'Weak (low appetite, bloating)', value: 'manda' },
      { label: 'Irregular (variable hunger)', value: 'vishama' },
    ],
  },
  {
    id: 'koshtha',
    category: 'Dashavidha Pariksha - Koshtha',
    question: 'How are your bowel movements (Koshtha)?',
    questionHindi: 'आपकी कोष्ठ (मल प्रकृति) कैसी है?',
    options: [
      { label: 'Regular (once daily, normal)', value: 'madhyama' },
      { label: 'Irregular / constipated', value: 'krura' },
      { label: 'Loose / frequent', value: 'mridu' },
      { label: 'Mixed', value: 'sama' },
    ],
  },
  {
    id: 'sara',
    category: 'Dashavidha Pariksha - Sara',
    question: 'How would you describe your tissue quality (Sara)?',
    questionHindi: 'आपकी सार (धातु गुण) कैसी है?',
    options: [
      { label: 'Excellent (strong, well-built)', value: 'pravara' },
      { label: 'Good', value: 'madhyama' },
      { label: 'Poor (weak, thin)', value: 'avara' },
    ],
  },
  {
    id: 'samhanana',
    category: 'Dashavidha Pariksha - Samhanana',
    question: 'How is your body build/compactness (Samhanana)?',
    questionHindi: 'आपकी संहनन (शरीर संरचना) कैसी है?',
    options: [
      { label: 'Well-built / compact', value: 'pravara' },
      { label: 'Medium build', value: 'madhyama' },
      { label: 'Lean / loose build', value: 'avara' },
    ],
  },
  {
    id: 'pramana',
    category: 'Dashavidha Pariksha - Pramana',
    question: 'How is your body proportion/measurements (Pramana)?',
    questionHindi: 'आपकी प्रमाण (शरीर माप) कैसी है?',
    options: [
      { label: 'Proportional / well-measured', value: 'pravara' },
      { label: 'Average', value: 'madhyama' },
      { label: 'Disproportionate', value: 'avara' },
    ],
  },
  {
    id: 'satmya',
    category: 'Dashavidha Pariksha - Satmya',
    question: 'What kind of food are you accustomed to (Satmya)?',
    questionHindi: 'आपकी सात्म्य (अभ्यस्त आहार) क्या है?',
    options: [
      { label: 'Comfortable with all tastes', value: 'sarvara' },
      { label: 'Prefers sweet/sour/salty', value: 'madhyama' },
      { label: 'Limited preferences only', value: 'avara' },
    ],
  },
  {
    id: 'sattva',
    category: 'Dashavidha Pariksha - Sattva',
    question: 'How is your mental temperament (Sattva)?',
    questionHindi: 'आपकी सत्त्व (मानसिक स्वभाव) कैसी है?',
    options: [
      { label: 'Calm and composed', value: 'pravara' },
      { label: 'Moderate temperament', value: 'madhyama' },
      { label: 'Anxious / easily disturbed', value: 'avara' },
    ],
  },
  {
    id: 'ahara_shakti',
    category: 'Dashavidha Pariksha - Ahara Shakti',
    question: 'How is your food intake capacity (Ahara Shakti)?',
    questionHindi: 'आपकी आहार शक्ति (भोजन क्षमता) कैसी है?',
    options: [
      { label: 'Good appetite, digests well', value: 'pravara' },
      { label: 'Moderate appetite', value: 'madhyama' },
      { label: 'Low appetite, poor digestion', value: 'avara' },
    ],
  },
  {
    id: 'vyayama_shakti',
    category: 'Dashavidha Pariksha - Vyayama Shakti',
    question: 'How is your physical exercise capacity (Vyayama Shakti)?',
    questionHindi: 'आपकी व्यायाम शक्ति (व्यायाम क्षमता) कैसी है?',
    options: [
      { label: 'Strong, can exercise well', value: 'pravara' },
      { label: 'Moderate capacity', value: 'madhyama' },
      { label: 'Low stamina', value: 'avara' },
    ],
  },
  {
    id: 'vaya',
    category: 'Dashavidha Pariksha - Vaya',
    question: 'Which age group do you belong to (Vaya)?',
    questionHindi: 'आप किस आयु वर्ग के हैं (वय)?',
    options: [
      { label: 'Childhood (0-12)', value: 'bala' },
      { label: 'Adolescence (13-16)', value: 'kumara' },
      { label: 'Young adult (17-60)', value: 'yuva' },
      { label: 'Elderly (60+)', value: 'vridha' },
    ],
  },
  {
    id: 'ahara_vihara',
    category: 'Ahara-Vihara',
    question: 'Describe your daily diet and lifestyle (Ahara-Vihara). What do you eat regularly?',
    questionHindi: 'अपने दैनिक आहार और जीवनशैली का वर्णन करें।',
    isFreeText: true,
  },
  {
    id: 'nidana',
    category: 'Nidana',
    question: 'What do you think caused your illness (Nidana)? Any specific trigger?',
    questionHindi: 'आपको क्या लगता है कि आपकी बीमारी का कारण क्या है (निदान)?',
    isFreeText: true,
  },
]

export function generateSummary(
  answers: Record<string, string>,
  mode: 'allopathic' | 'ayush'
): ClinicalSummary {
  const summary: ClinicalSummary = {
    chief_complaint: answers['chief_complaint'] || 'Not specified',
    hpi: [
      `Onset: ${answers['hpi_onset'] || 'Not specified'}`,
      `Duration: ${answers['hpi_duration'] || 'Not specified'}`,
      `Severity: ${answers['hpi_severity'] || 'Not specified'}`,
      `Associated symptoms: ${answers['hpi_associated'] || 'None reported'}`,
    ].join('\n'),
    past_medical_history: [
      `Medical: ${answers['past_medical'] || 'None reported'}`,
      `Surgical: ${answers['past_surgical'] || 'None reported'}`,
    ].join('\n'),
    drug_allergy_history: [
      `Allergies: ${answers['drug_allergy'] || 'No known allergies'}`,
      `Current medications: ${answers['current_medication'] || 'None reported'}`,
    ].join('\n'),
    family_history: answers['family_history'] || 'Not significant',
    personal_history: answers['personal_history'] || 'Not specified',
    review_of_systems: answers['ros_general'] || 'Not specified',
    prior_investigations: 'See digitized documents',
  }

  if (mode === 'ayush') {
    summary.ayush_assessment = {
      prakriti: answers['prakriti'] || 'Not assessed',
      vikriti: answers['vikriti'] || 'Not assessed',
      agni: answers['agni'] || 'Not assessed',
      koshtha: answers['koshtha'] || 'Not assessed',
      sara: answers['sara'] || 'Not assessed',
      samhanana: answers['samhanana'] || 'Not assessed',
      pramana: answers['pramana'] || 'Not assessed',
      satmya: answers['satmya'] || 'Not assessed',
      sattva: answers['sattva'] || 'Not assessed',
      ahara_shakti: answers['ahara_shakti'] || 'Not assessed',
      vyayama_shakti: answers['vyayama_shakti'] || 'Not assessed',
      vaya: answers['vaya'] || 'Not assessed',
    } as AyushAssessment
  }

  return summary
}
