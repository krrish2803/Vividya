import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, Globe, Moon, Sun, ChevronRight, MessageSquare, Zap } from 'lucide-react';

export default function Header({ lang, setLang, onOpenDemo }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Scrollspy active link check
      const sections = ['home', 'features', 'solutions', 'how-it-works', 'pricing', 'faq'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: lang === 'en' ? 'Home' : lang === 'hi' ? 'होम' : 'Home', href: '#home' },
    { id: 'features', label: lang === 'en' ? 'Features' : lang === 'hi' ? 'फीचर्स' : 'Features', href: '#features' },
    { id: 'solutions', label: lang === 'en' ? 'Solutions' : lang === 'hi' ? 'समाधान' : 'Solutions', href: '#solutions' },
    { id: 'how-it-works', label: lang === 'en' ? 'How It Works' : lang === 'hi' ? 'कैसे काम करता है' : 'How It Works', href: '#how-it-works' },
    { id: 'pricing', label: lang === 'en' ? 'Pricing' : lang === 'hi' ? 'प्राइजिंग' : 'Pricing', href: '#pricing' },
    { id: 'faq', label: lang === 'en' ? 'FAQ' : lang === 'hi' ? 'सवाल' : 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-darkBg/85 backdrop-blur-md border-b border-white/10 shadow-2xl py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo Branding */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-primary-gradient p-[1.5px] flex items-center justify-center shadow-lg shadow-sarthiPrimary/30 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-gradient opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <Sparkles className="w-5 h-5 text-sarthiPink animate-pulse" />
            </div>
            {/* Pulsing indicator light */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sarthiGold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sarthiGold"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-extrabold text-xl tracking-tight text-white group-hover:text-sarthiPink transition-colors">
                Vividya <span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono bg-sarthiPurple/20 text-sarthiPurple px-1.5 py-0.5 rounded border border-sarthiPurple/30">
                विविद्या
              </span>
            </div>
            <p className="text-[11px] text-sarthiMuted font-medium leading-none mt-0.5">
              Your AI College & Career Guide
            </p>
          </div>
        </a>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1 bg-darkSurface/60 backdrop-blur-md p-1.5 rounded-full border border-white/5">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeSection === link.id
                  ? 'text-white font-semibold'
                  : 'text-sarthiMuted hover:text-white'
              }`}
            >
              {activeSection === link.id && (
                <span className="absolute inset-0 bg-primary-gradient opacity-90 rounded-full shadow-md -z-10 animate-fade-in"></span>
              )}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Language Switcher Dropdown */}
          <div className="relative flex items-center bg-darkSurface border border-white/10 rounded-lg p-1 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-sarthiMuted ml-1.5 mr-1" />
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'en' ? 'bg-sarthiPurple text-white font-bold' : 'text-sarthiMuted hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'hi' ? 'bg-sarthiPurple text-white font-bold' : 'text-sarthiMuted hover:text-white'
              }`}
              title="Hindi (हिन्दी)"
            >
              HI
            </button>
            <button
              onClick={() => setLang('hinglish')}
              className={`px-2 py-1 rounded transition-colors ${
                lang === 'hinglish' ? 'bg-sarthiPurple text-white font-bold' : 'text-sarthiMuted hover:text-white'
              }`}
              title="Hinglish"
            >
              HIN
            </button>
          </div>

          {/* Sign In Button */}
          <button 
            onClick={() => navigate('/auth')}
            className="text-xs font-semibold text-sarthiMuted hover:text-white px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
          >
            {lang === 'hi' ? 'साइन इन' : 'Sign In'}
          </button>

          {/* Primary CTA */}
          <button 
            onClick={() => navigate('/auth')}
            className="group relative inline-flex items-center gap-2 text-xs font-bold text-white bg-primary-gradient px-4 py-2 rounded-lg shadow-lg shadow-sarthiPrimary/25 hover:shadow-sarthiPrimary/50 hover:scale-105 transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sarthiGold fill-sarthiGold animate-bounce-subtle" />
              {lang === 'hi' ? 'मुफ्त शुरू करें' : 'Try Free'}
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile Language selector */}
          <button
            onClick={() => {
              if (lang === 'en') setLang('hi');
              else if (lang === 'hi') setLang('hinglish');
              else setLang('en');
            }}
            className="flex items-center gap-1 text-xs font-mono font-bold bg-darkSurface px-2.5 py-1.5 rounded-lg border border-white/10 text-sarthiGold"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-darkSurface text-sarthiText hover:text-white border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-sarthiPink" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-darkBg/95 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-6 mt-3 space-y-3 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => { setLang('en'); }}
              className={`py-2 text-xs font-mono font-semibold rounded-lg border ${
                lang === 'en' ? 'bg-sarthiPurple text-white border-sarthiPurple' : 'bg-darkSurface text-sarthiMuted border-white/10'
              }`}
            >
              English
            </button>
            <button
              onClick={() => { setLang('hi'); }}
              className={`py-2 text-xs font-mono font-semibold rounded-lg border ${
                lang === 'hi' ? 'bg-sarthiPurple text-white border-sarthiPurple' : 'bg-darkSurface text-sarthiMuted border-white/10'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => { setLang('hinglish'); }}
              className={`col-span-2 py-2 text-xs font-mono font-semibold rounded-lg border ${
                lang === 'hinglish' ? 'bg-sarthiPurple text-white border-sarthiPurple' : 'bg-darkSurface text-sarthiMuted border-white/10'
              }`}
            >
              Hinglish (Hindi + Eng)
            </button>
          </div>

          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-sarthiText hover:bg-darkSurface hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
              className="w-full py-3 rounded-xl bg-primary-gradient text-white font-bold text-center shadow-lg shadow-sarthiPrimary/30"
            >
              🚀 {lang === 'hi' ? 'मुफ्त यात्रा शुरू करें' : 'Start Free Journey'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
