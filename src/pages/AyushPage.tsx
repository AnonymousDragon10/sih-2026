import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, Check, ArrowRight, Leaf, Brain, Heart, Zap, Activity, FlaskConical, Scale, Eye, Sparkles } from 'lucide-react'
import { addChatMessage, getChatMessages } from '../lib/api'
import { ayushQuestions, type InterviewQuestion } from '../lib/clinicalEngine'
import { BottleLoader } from '../components/BottleLoader'

export function AyushPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [completed, setCompleted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const sid = localStorage.getItem('medikiosk_session_id')
    if (sid) {
      setSessionId(sid)
      getChatMessages(sid).then((messages) => {
        const restoredAnswers: Record<string, string> = {}
        messages.forEach((msg) => {
          if (msg.role === 'user' && msg.question_type) {
            restoredAnswers[msg.question_type] = msg.content
          }
        })
        setAnswers(restoredAnswers)

        const ayushAnswered = ayushQuestions.filter((q) => restoredAnswers[q.id]).length
        setQuestionIndex(Math.min(ayushAnswered, ayushQuestions.length))
        if (ayushAnswered >= ayushQuestions.length) {
          setCompleted(true)
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const handleAnswer = async (value: string, label: string) => {
    if (!sessionId || isProcessing) return

    const currentQ = ayushQuestions[questionIndex]
    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)
    setIsProcessing(true)

    await addChatMessage(sessionId, 'user', label, 'text', currentQ.id)

    setTimeout(() => {
      if (questionIndex + 1 < ayushQuestions.length) {
        setQuestionIndex(questionIndex + 1)
      } else {
        setCompleted(true)
      }
      setIsProcessing(false)
    }, 500)
  }

  const dashavidhaParams = [
    { name: 'Prakriti', icon: Leaf, desc: 'Body Constitution' },
    { name: 'Vikriti', icon: Activity, desc: 'Current Imbalance' },
    { name: 'Agni', icon: Zap, desc: 'Digestive Fire' },
    { name: 'Koshtha', icon: Scale, desc: 'Bowel Nature' },
    { name: 'Sara', icon: Sparkles, desc: 'Tissue Quality' },
    { name: 'Samhanana', icon: Heart, desc: 'Body Build' },
    { name: 'Pramana', icon: Eye, desc: 'Body Proportion' },
    { name: 'Satmya', icon: FlaskConical, desc: 'Accustomed Food' },
    { name: 'Sattva', icon: Brain, desc: 'Mental Temperament' },
    { name: 'Ahara Shakti', icon: Leaf, desc: 'Food Capacity' },
    { name: 'Vyayama Shakti', icon: Activity, desc: 'Exercise Capacity' },
    { name: 'Vaya', icon: Scale, desc: 'Age Group' },
  ]

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card p-12">
          <BottleLoader progress={50} label="Loading AYUSH assessment..." />
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">AYUSH Assessment Complete</h1>
          <p className="text-primary-600">Dashavidha Pariksha has been recorded</p>
        </motion.div>

        <div className="glass-card p-6 mb-6">
          <h2 className="font-display text-xl font-semibold text-primary-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-warning-500" />
            Dashavidha Pariksha Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashavidhaParams.map((param, i) => {
              const Icon = param.icon
              const answerKey = ayushQuestions[i]?.id
              const answer = answerKey ? answers[answerKey] : null
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-4 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-primary-700">{param.name}</h3>
                      <p className="text-xs text-primary-400">{param.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary-600 capitalize">{answer || 'Not assessed'}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/summary')}
            className="glass-button px-6 py-3 flex items-center gap-2"
          >
            <Check size={18} /> View Full Summary
          </button>
        </div>
      </div>
    )
  }

  const currentQ: InterviewQuestion = ayushQuestions[questionIndex]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-100 text-warning-700 text-sm font-medium mb-3">
          <Leaf size={16} /> Ayurvedic Assessment Mode
        </div>
        <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Dashavidha Pariksha</h1>
        <p className="text-primary-600">Ten-fold Ayurvedic examination for personalized care</p>
      </motion.div>

      {/* Progress */}
      <div className="glass-card p-2 mb-4">
        <div className="flex items-center justify-between text-xs text-primary-500 mb-1.5 px-2">
          <span>Progress</span>
          <span>{questionIndex + 1} / {ayushQuestions.length}</span>
        </div>
        <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-warning-400 to-warning-600 rounded-full"
            animate={{ width: `${((questionIndex + 1) / ayushQuestions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-medium text-warning-600">{currentQ.category}</span>
              <h2 className="font-display text-lg font-semibold text-primary-800">{currentQ.question}</h2>
            </div>
          </div>

          {currentQ.options ? (
            <div className="grid grid-cols-1 gap-2">
              {currentQ.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value, opt.label)}
                  disabled={isProcessing}
                  className={`glass p-4 rounded-xl text-left transition-all hover:bg-primary-50 hover:scale-[1.02] ${
                    answers[currentQ.id] === opt.value ? 'ring-2 ring-warning-500 bg-warning-50' : ''
                  }`}
                >
                  <span className="text-sm text-primary-700">{opt.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                placeholder="Type your answer here..."
                className="glass-input w-full px-4 py-3 text-primary-800 min-h-[100px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.currentTarget as HTMLTextAreaElement).value.trim()) {
                    handleAnswer((e.currentTarget as HTMLTextAreaElement).value, (e.currentTarget as HTMLTextAreaElement).value)
                  }
                }}
              />
              <button
                onClick={() => {
                  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                  if (textarea?.value.trim()) {
                    handleAnswer(textarea.value, textarea.value)
                  }
                }}
                disabled={isProcessing}
                className="glass-button w-full mt-3 py-3 flex items-center justify-center gap-2"
              >
                Submit Answer <ArrowRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dashavidha overview */}
      <div className="mt-6 glass-card p-4">
        <h3 className="text-sm font-semibold text-primary-700 mb-3">Dashavidha Pariksha Parameters</h3>
        <div className="flex flex-wrap gap-2">
          {dashavidhaParams.map((param, i) => {
            const Icon = param.icon
            const isAnswered = answers[ayushQuestions[i]?.id]
            const isCurrent = i === questionIndex
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isAnswered
                    ? 'bg-success-100 text-success-700'
                    : isCurrent
                    ? 'bg-warning-100 text-warning-700 ring-1 ring-warning-400'
                    : 'glass text-primary-400'
                }`}
              >
                <Icon size={12} />
                {param.name}
                {isAnswered && <Check size={12} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
