import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/auth'
import { Navbar } from './components/Navbar'
import { AccessibilityPanel } from './components/AccessibilityPanel'
import { BackgroundBlobs, FloatingMedicalIcons } from './components/BackgroundBlobs'
import { HomePage } from './pages/HomePage'
import { IdentifyPage } from './pages/IdentifyPage'
import { ChatPage } from './pages/ChatPage'
import { ScanPage } from './pages/ScanPage'
import { SummaryPage } from './pages/SummaryPage'
import { AyushPage } from './pages/AyushPage'
import { ConsentPage } from './pages/ConsentPage'
import { AuthPage } from './pages/AuthPage'
import { RecordsPage } from './pages/RecordsPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <BackgroundBlobs />
        <FloatingMedicalIcons />
        <div className="relative z-10 min-h-screen pt-20">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/identify" element={<IdentifyPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/ayush" element={<AyushPage />} />
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/his" element={<RecordsPage his />} />
          </Routes>
          <AccessibilityPanel />
        </div>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
