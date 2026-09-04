import { motion } from 'framer-motion'

interface BottleLoaderProps {
  progress: number
  label?: string
}

export function BottleLoader({ progress, label = 'Processing...' }: BottleLoaderProps) {
  const fillHeight = Math.min(progress, 100)

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="bottle-container">
        <div className="bottle-3d">
          <div className="bottle-cap" />
          <div className="bottle-neck" />
          <div className="bottle-body">
            <div
              className="bottle-liquid"
              style={{ height: `${fillHeight}%` }}
            >
              <div className="bubble" style={{ width: '8px', height: '8px', left: '20%', bottom: '10px', animationDelay: '0s' }} />
              <div className="bubble" style={{ width: '6px', height: '6px', left: '50%', bottom: '20px', animationDelay: '0.5s' }} />
              <div className="bubble" style={{ width: '10px', height: '10px', left: '70%', bottom: '5px', animationDelay: '1s' }} />
              <div className="bubble" style={{ width: '5px', height: '5px', left: '35%', bottom: '30px', animationDelay: '1.5s' }} />
            </div>
            <div className="bottle-shine" />
            <div className="bottle-label">MediKiosk</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="text-2xl font-bold text-primary-700 font-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(progress)}%
        </motion.div>
        <motion.div
          className="text-sm text-primary-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {label}
        </motion.div>
        <div className="w-48 h-2 bg-primary-100 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full progress-fill rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${fillHeight}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}
