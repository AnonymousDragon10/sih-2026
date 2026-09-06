import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Activity, MessageSquare, ScanLine, FileText, Stethoscope, Shield, ArrowRight, Heart, Brain, Eye, Clock, Users, Languages } from 'lucide-react'

export function HomePage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Conversational AI History',
      description: 'Adaptive voice and touch-based clinical interview in your preferred language',
      link: '/chat',
      color: 'from-primary-400 to-primary-600',
    },
    {
      icon: ScanLine,
      title: 'Document Digitization',
      description: 'OCR-powered scanning of prescriptions, lab reports, and discharge summaries',
      link: '/scan',
      color: 'from-accent-400 to-accent-600',
    },
    {
      icon: FileText,
      title: 'Structured Summary',
      description: 'Physician-ready clinical history summary generated in seconds',
      link: '/summary',
      color: 'from-success-400 to-success-600',
    },
    {
      icon: Stethoscope,
      title: 'AYUSH Mode',
      description: 'Dashavidha Pariksha assessment for Ayurvedic consultations',
      link: '/ayush',
      color: 'from-warning-400 to-warning-600',
    },
    {
      icon: Shield,
      title: 'Consent & Privacy',
      description: 'DPDP Act 2023 compliant with ABDM integration and granular consent',
      link: '/consent',
      color: 'from-primary-500 to-accent-500',
    },
    {
      icon: Activity,
      title: 'Red-Flag Detection',
      description: 'Emergency symptom detection with priority triage alerts',
      link: '/identify',
      color: 'from-error-400 to-error-600',
    },
  ]

  const stats = [
    { icon: Clock, value: '2 min', label: 'Avg consultation time in India' },
    { icon: Users, value: '10,000+', label: 'OPD patients per day' },
    { icon: Languages, value: '10+', label: 'Indian languages supported' },
    { icon: Heart, value: '80%', label: 'Diagnoses from history alone' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-sm font-medium text-primary-700">AI-Driven Public Health Chatbot</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl md:text-6xl font-bold text-primary-800 leading-tight mb-4"
        >
          MediKiosk
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-primary-600 max-w-2xl mx-auto mb-8"
        >
          AI-Powered Clinical History Software Platform for Disease Awareness.
          Comprehensive history taking before you enter the consultation room.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/auth?role=patient">
            <button className="glass-button px-8 py-4 text-lg flex items-center gap-2 mx-auto">
              Start Patient Registration
              <ArrowRight size={20} />
            </button>
          </Link>
          <Link to="/chat">
            <button className="glass-button-secondary px-8 py-4 text-lg flex items-center gap-2 mx-auto">
              <MessageSquare size={20} />
              Try AI Chat
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <Icon className="w-8 h-8 mx-auto mb-3 text-primary-500" />
              <div className="font-display text-2xl font-bold text-primary-800">{stat.value}</div>
              <div className="text-sm text-primary-500 mt-1">{stat.label}</div>
            </motion.div>
          )
        })}
      </section>

      {/* Features Grid */}
      <section className="py-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold text-primary-800 text-center mb-12"
        >
          Platform Modules
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-enter"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Link to={feature.link}>
                  <div className="glass-card p-6 h-full cursor-pointer group">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-primary-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-primary-600">{feature.description}</p>
                    <div className="flex items-center gap-1 mt-4 text-primary-500 text-sm font-medium group-hover:gap-2 transition-all">
                      Explore <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Patient Journey */}
      <section className="py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold text-primary-800 text-center mb-12"
        >
          End-to-End Patient Journey
        </motion.h2>

        <div className="flex flex-col md:flex-row gap-4 md:gap-2 justify-center items-stretch">
          {[
            { step: 1, title: 'Identify', icon: Activity, desc: 'Register with ABHA ID or Aadhaar, select language, grant consent' },
            { step: 2, title: 'Converse', icon: MessageSquare, desc: 'AI conducts adaptive voice + touch history interview' },
            { step: 3, title: 'Scan', icon: ScanLine, desc: 'Upload prescriptions & lab reports for digitization' },
            { step: 4, title: 'Summarize', icon: FileText, desc: 'AI generates structured history summary for physician' },
            { step: 5, title: 'Consult', icon: Stethoscope, desc: 'Physician reviews complete history in seconds' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex-1"
              >
                <div className="glass-card p-5 h-full relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <Icon className="w-5 h-5 text-primary-500" />
                  </div>
                  <h3 className="font-display font-semibold text-primary-800 mb-1">{item.title}</h3>
                  <p className="text-xs text-primary-600">{item.desc}</p>
                  {i < 4 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-300" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center">
        <div className="flex items-center justify-center gap-4 text-primary-500 mb-4">
          <Heart className="w-5 h-5" />
          <Brain className="w-5 h-5" />
          <Eye className="w-5 h-5" />
        </div>
        <p className="text-sm text-primary-500">
          MediKiosk - Smart India Hackathon 2026 | AI-Driven Public Health Chatbot for Disease Awareness
        </p>
      </footer>
    </div>
  )
}
