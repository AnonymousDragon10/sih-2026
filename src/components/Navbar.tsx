import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, MessageSquare, ScanLine, FileText, Stethoscope, Shield, Activity } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/identify', label: 'Patient', icon: Activity },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/scan', label: 'Scan', icon: ScanLine },
  { to: '/summary', label: 'Summary', icon: FileText },
  { to: '/ayush', label: 'AYUSH', icon: Stethoscope },
  { to: '/consent', label: 'Consent', icon: Shield },
]

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 rounded-xl glass flex items-center justify-center shadow-lg overflow-hidden"
          >
            <div className="relative w-10 h-10 overflow-hidden rounded-lg">
              <img src="/WhatsApp_Image_2026-09-03_at_19.30.17.jpeg" alt="MediKiosk medical emblem" className="absolute w-24 h-24 max-w-none -left-7 -top-2" />
            </div>
          </motion.div>
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-primary-700'
                    : 'text-primary-500 hover:text-primary-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-primary-100 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        <div className="md:hidden flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`p-2 rounded-lg transition-all ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'text-primary-500'
                }`}
              >
                <Icon size={18} />
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
