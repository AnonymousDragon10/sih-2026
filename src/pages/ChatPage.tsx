import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Send, Mic, MicOff, AlertTriangle, ScanLine, FileText, Check, Volume2, Stethoscope, Activity } from 'lucide-react'
import { addChatMessage, getChatMessages, addRedFlag, flagSession } from '../lib/api'
import {
  allopathicQuestions,
  ayushQuestions,
  checkRedFlags,
  type InterviewQuestion,
} from '../lib/clinicalEngine'
import { BottleLoader } from '../components/BottleLoader'
import { getLanguagePack, localizeQuestions } from '../lib/i18n'
import type { Language } from '../types'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  questionType?: string
}

export function ChatPage() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mode, setMode] = useState<'allopathic' | 'ayush'>('allopathic')
  const [language, setLanguage] = useState<Language>('en')
  const [redFlagAlert, setRedFlagAlert] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const questions: InterviewQuestion[] = localizeQuestions(
    mode === 'ayush' ? ayushQuestions : allopathicQuestions,
    language,
  )
  const languagePack = getLanguagePack(language)

  useEffect(() => {
    const sid = localStorage.getItem('medikiosk_session_id')
    const m = localStorage.getItem('medikiosk_mode') as 'allopathic' | 'ayush' | null
    const lang = localStorage.getItem('medikiosk_language')

    if (sid) {
      setSessionId(sid)
      if (m) setMode(m)
      if (lang) setLanguage(lang as Language)

      getChatMessages(sid).then((existing) => {
        if (existing.length > 0) {
          const restored: Message[] = existing.map((m) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            questionType: m.question_type ?? undefined,
          }))
          setMessages(restored)
          const answeredCount = existing.filter((m) => m.role === 'user').length
          setQuestionIndex(Math.min(answeredCount, questions.length))
          const restoredAnswers: Record<string, string> = {}
          existing.forEach((msg) => {
            if (msg.role === 'user' && msg.question_type) {
              restoredAnswers[msg.question_type] = msg.content
            }
          })
          setAnswers(restoredAnswers)
          if (answeredCount >= questions.length) {
            setCompleted(true)
          }
        } else {
          startConversation(sid, m || 'allopathic')
        }
        setLoadingMessages(false)
      })
    } else {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startConversation = async (sid: string, m: string) => {
    const q = localizeQuestions(m === 'ayush' ? ayushQuestions : allopathicQuestions, language)[0]
    const greeting: Message = {
      role: 'assistant',
      content: `${languagePack.greeting}\n\n${q.question}`,
      questionType: q.id,
    }
    setMessages([greeting])
    await addChatMessage(sid, 'assistant', greeting.content, 'text', q.id)
  }

  const handleSend = async () => {
    if (!currentInput.trim() || !sessionId || isProcessing) return

    const answer = currentInput.trim()
    const currentQ = questions[questionIndex]

    const userMsg: Message = { role: 'user', content: answer }
    setMessages((prev) => [...prev, userMsg])
    await addChatMessage(sessionId, 'user', answer, isListening ? 'voice' : 'text', currentQ.id)

    const newAnswers = { ...answers, [currentQ.id]: answer }
    setAnswers(newAnswers)
    setCurrentInput('')
    setIsProcessing(true)

    const redFlag = checkRedFlags(answer) || (currentQ.redFlagCheck ? currentQ.redFlagCheck(answer) : null)
    if (redFlag) {
      setRedFlagAlert(redFlag.description)
      await addRedFlag(sessionId, redFlag.flagType, redFlag.severity, redFlag.description)
      await flagSession(sessionId)
    }

    const nextIndex = questionIndex + 1
    setProgress((nextIndex / questions.length) * 100)

    setTimeout(async () => {
      if (nextIndex < questions.length) {
        const nextQ = questions[nextIndex]
        const assistantMsg: Message = {
          role: 'assistant',
          content: nextQ.question,
          questionType: nextQ.id,
        }
        setMessages((prev) => [...prev, assistantMsg])
        await addChatMessage(sessionId, 'assistant', nextQ.question, 'text', nextQ.id)
        setQuestionIndex(nextIndex)
      } else {
        const completionMsg: Message = {
          role: 'assistant',
          content: languagePack.completion,
        }
        setMessages((prev) => [...prev, completionMsg])
        await addChatMessage(sessionId, 'assistant', completionMsg.content, 'text', 'completion')
        setCompleted(true)
      }
      setIsProcessing(false)
    }, 600)
  }

  const handleOptionClick = async (value: string, label: string) => {
    if (!sessionId || isProcessing) return

    const currentQ = questions[questionIndex]
    const userMsg: Message = { role: 'user', content: label }
    setMessages((prev) => [...prev, userMsg])
    await addChatMessage(sessionId, 'user', label, 'text', currentQ.id)

    const newAnswers = { ...answers, [currentQ.id]: value }
    setAnswers(newAnswers)
    setIsProcessing(true)

    const redFlag = checkRedFlags(label) || (currentQ.redFlagCheck ? currentQ.redFlagCheck(value) : null)
    if (redFlag) {
      setRedFlagAlert(redFlag.description)
      await addRedFlag(sessionId, redFlag.flagType, redFlag.severity, redFlag.description)
      await flagSession(sessionId)
    }

    const nextIndex = questionIndex + 1
    setProgress((nextIndex / questions.length) * 100)

    setTimeout(async () => {
      if (nextIndex < questions.length) {
        const nextQ = questions[nextIndex]
        const assistantMsg: Message = {
          role: 'assistant',
          content: nextQ.question,
          questionType: nextQ.id,
        }
        setMessages((prev) => [...prev, assistantMsg])
        await addChatMessage(sessionId, 'assistant', nextQ.question, 'text', nextQ.id)
        setQuestionIndex(nextIndex)
      } else {
        const completionMsg: Message = {
          role: 'assistant',
          content: languagePack.completion,
        }
        setMessages((prev) => [...prev, completionMsg])
        await addChatMessage(sessionId, 'assistant', completionMsg.content, 'text', 'completion')
        setCompleted(true)
      }
      setIsProcessing(false)
    }, 600)
  }

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please use text input.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    const speechLocales: Record<Language, string> = {
      en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN',
      mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', pa: 'pa-IN', ml: 'ml-IN',
    }
    recognition.lang = speechLocales[language]
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setCurrentInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const currentQ = questions[questionIndex]

  if (loadingMessages) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card p-12">
          <BottleLoader progress={50} label="Loading your conversation..." />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-primary-800 mb-1">
          {mode === 'ayush' ? 'AYUSH Clinical Interview' : 'AI Clinical History Interview'}
        </h1>
        <p className="text-sm text-primary-500">
          Question {Math.min(questionIndex + 1, questions.length)} of {questions.length}
        </p>
      </motion.div>

      {/* Progress bar */}
      <div className="glass-card p-2 mb-4">
        <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full progress-fill rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Red flag alert */}
      <AnimatePresence>
        {redFlagAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-4 mb-4 border-2 border-error-400 bg-error-50"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-error-700">Red Flag Alert</h3>
                <p className="text-sm text-error-600">{redFlagAlert}</p>
                <p className="text-xs text-error-500 mt-1">This has been flagged for priority triage.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages */}
      <div className="glass-card p-6 mb-4 h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
                    : msg.role === 'system'
                    ? 'bg-warning-100 text-warning-800 rounded-bl-sm'
                    : 'glass text-primary-800 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-medium text-primary-500">{languagePack.assistant}</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="glass p-4 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-2">
                  <div className="typing-dot w-2 h-2 rounded-full bg-primary-400" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-primary-400" />
                  <div className="typing-dot w-2 h-2 rounded-full bg-primary-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick options for current question */}
      {!completed && currentQ?.options && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {currentQ.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleOptionClick(opt.value, opt.label)}
              className="glass-button-secondary px-4 py-2 text-sm"
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input area */}
      {!completed ? (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoice}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-error-500 text-white animate-pulse'
                  : 'glass-button-secondary'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : 'Type your answer or use the microphone...'}
              disabled={isListening || isProcessing}
              className="glass-input flex-1 px-4 py-3 text-primary-800"
            />
            <button
              onClick={handleSend}
              disabled={!currentInput.trim() || isProcessing}
              className="glass-button p-3 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-primary-400">
            <Volume2 size={14} />
            <span>{languagePack.voiceHint} Voice uses Bhashini ASR for Indian languages.</span>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="font-display text-xl font-semibold text-primary-800 mb-2">History Complete!</h3>
          <p className="text-sm text-primary-600 mb-4">Your clinical history has been recorded successfully.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/scan')}
              className="glass-button-secondary px-6 py-3 flex items-center gap-2"
            >
              <ScanLine size={18} /> Scan Documents
            </button>
            <button
              onClick={() => navigate('/summary')}
              className="glass-button px-6 py-3 flex items-center gap-2"
            >
              <FileText size={18} /> View Summary
            </button>
          </div>
        </motion.div>
      )}

      {redFlagAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 text-sm text-error-600 justify-center"
        >
          <Activity size={16} />
          <span>Emergency symptoms detected - priority triage has been notified</span>
        </motion.div>
      )}
    </div>
  )
}
