import { motion } from 'framer-motion'

export function BackgroundBlobs() {
  return (
    <>
      <div className="bg-blob bg-blob-1" />
      <div className="bg-blob bg-blob-2" />
      <div className="bg-blob bg-blob-3" />
    </>
  )
}

export function FloatingMedicalIcons() {
  const icons = [
    { emoji: '💊', top: '15%', left: '8%', delay: 0, duration: 5 },
    { emoji: '🩺', top: '70%', left: '12%', delay: 1, duration: 6 },
    { emoji: '📋', top: '25%', left: '85%', delay: 0.5, duration: 5.5 },
    { emoji: '⚗️', top: '65%', left: '88%', delay: 1.5, duration: 4.5 },
    { emoji: '💊', top: '45%', left: '5%', delay: 2, duration: 7 },
    { emoji: '🧬', top: '80%', left: '45%', delay: 0.8, duration: 6.5 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-20"
          style={{ top: icon.top, left: icon.left }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            delay: icon.delay,
            ease: 'easeInOut',
          }}
        >
          {icon.emoji}
        </motion.div>
      ))}
    </div>
  )
}
