import React, { useState } from 'react';
import './i18n';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { DashboardSkeleton, PageSkeleton } from './components/Skeleton';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorks from './components/HowItWorks';
import UspSection from './components/UspSection';
import SocialProof from './components/SocialProof';
import FaqSection from './components/FaqSection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import FloatingBot from './components/FloatingBot';
import VideoModal from './components/VideoModal';
import DashboardLayout from './components/DashboardLayout';
import AuthPage from './pages/AuthPage';
import DashboardHome from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import ResumePage from './pages/ResumePage';
import CareerPage from './pages/CareerPage';
import WellnessPage from './pages/WellnessPage';
import TimetablePage from './pages/TimetablePage';
import RAGNotesPage from './pages/RAGNotesPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center animate-pulse">
          <span className="text-white text-xl">✦</span>
        </div>
        <div className="space-y-2 text-center">
          <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse mx-auto" />
          <div className="h-3 w-24 bg-white/5 rounded-full animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" />;
}

function LandingPage() {
  const [lang, setLang] = useState('en');
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-darkBg text-sarthiText transition-colors duration-300 font-sans">
      <Header lang={lang} setLang={setLang} onOpenDemo={() => setDemoOpen(true)} />
      <main>
        <Hero lang={lang} onOpenDemo={() => setDemoOpen(true)} />
        <ProblemSection lang={lang} />
        <SolutionSection lang={lang} />
        <FeaturesSection lang={lang} />
        <HowItWorks lang={lang} />
        <UspSection lang={lang} />
        <SocialProof lang={lang} />
        <FaqSection lang={lang} />
        <CtaSection lang={lang} />
      </main>
      <Footer lang={lang} setLang={setLang} />
      <FloatingBot lang={lang} />
      <VideoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="wellness" element={<WellnessPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="notes" element={<RAGNotesPage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="career" element={<CareerPage />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRoutes /></ProtectedRoute>} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
