import { useEffect, useState, useRef } from 'react'
import { Accessibility, Volume2, Type, Contrast, Video, X } from 'lucide-react'

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [audio, setAudio] = useState(false)
  const lastSpoken = useRef('')

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText)
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [largeText, highContrast])

  useEffect(() => {
    if (!audio) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const el = target.closest('button, a, h1, h2, h3, p, label, span, input, [role="button"]') as HTMLElement | null
      if (!el) return
      const text = el.innerText?.trim() || el.getAttribute('aria-label') || ''
      if (!text || text === lastSpoken.current) return
      lastSpoken.current = text
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0, 200)))
      }
    }
    document.addEventListener('mouseover', handler)
    return () => document.removeEventListener('mouseover', handler)
  }, [audio])

  return <>
    <button onClick={() => setOpen(!open)} aria-label="Accessibility options" className="fixed top-20 right-4 z-50 w-11 h-11 rounded-full glass-button flex items-center justify-center shadow-xl"><Accessibility size={20} /></button>
    {open && <div className="fixed top-32 right-4 z-50 w-72 glass-card p-5"><div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-primary-800">Accessibility</h2><button onClick={() => setOpen(false)} className="text-primary-500"><X size={18} /></button></div><div className="space-y-2"><button onClick={() => setLargeText(!largeText)} className={`w-full p-3 rounded-xl flex items-center gap-3 text-left ${largeText ? 'bg-primary-100' : 'glass'}`}><Type size={18} className="text-primary-600" /><span className="text-sm text-primary-800">Large text</span></button><button onClick={() => setHighContrast(!highContrast)} className={`w-full p-3 rounded-xl flex items-center gap-3 text-left ${highContrast ? 'bg-primary-100' : 'glass'}`}><Contrast size={18} className="text-primary-600" /><span className="text-sm text-primary-800">High contrast</span></button><button onClick={() => setAudio(!audio)} className={`w-full p-3 rounded-xl flex items-center gap-3 text-left ${audio ? 'bg-primary-100' : 'glass'}`}><Volume2 size={18} className="text-primary-600" /><span className="text-sm text-primary-800">Audio guidance {audio ? '(on — hover to hear)' : ''}</span></button><div className="w-full p-3 rounded-xl glass flex items-center gap-3"><Video size={18} className="text-primary-600" /><span className="text-sm text-primary-800">Sign language avatar<br /><span className="text-xs text-primary-500">Video-ready accessibility mode</span></span></div></div></div>}
  </>
}
