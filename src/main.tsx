import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { Navbar } from './components/Navbar'
import { BackgroundBlobs, FloatingMedicalIcons } from './components/BackgroundBlobs'
import { HomePage } from './pages/HomePage'
import { IdentifyPage } from './pages/IdentifyPage'
import { ChatPage } from './pages/ChatPage'
import { ScanPage } from './pages/ScanPage'
import { SummaryPage } from './pages/SummaryPage'
import { AyushPage } from './pages/AyushPage'
import { ConsentPage } from './pages/ConsentPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BackgroundBlobs />
      <FloatingMedicalIcons />
      <div className="relative z-10 min-h-screen pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/identify" element={<IdentifyPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/ayush" element={<AyushPage />} />
          <Route path="/consent" element={<ConsentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>,
)
