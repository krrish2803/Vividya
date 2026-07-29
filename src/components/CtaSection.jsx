import React from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../data/translations';
import { Sparkles, ArrowRight, Calendar, MessageSquare } from 'lucide-react';

export default function CtaSection({ lang, onOpenDemo }) {
  const navigate = useNavigate();
  const t = translations[lang].ctaBanner;

  return (
    <section className="py-24 bg-primary-gradient relative overflow-hidden text-center text-white">
      {/* Ambient particles background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/30 text-xs font-mono font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-sarthiGold" />
          <span>JOIN INDIA'S #1 AI STUDENT COMMUNITY</span>
        </div>

        {/* Main Headline */}
        <h2 className="font-headline font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
          {t.title}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto font-headline font-extrabold text-base bg-white text-sarthiPurple hover:bg-sarthiGold hover:text-darkBg px-8 py-4 rounded-xl shadow-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>{t.primaryBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenDemo}
            className="w-full sm:w-auto font-headline font-bold text-base bg-darkBg/30 hover:bg-darkBg/60 text-white border border-white/30 px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            <span>{t.secondaryBtn}</span>
          </button>
        </div>

        {/* Guarantee subtext */}
        <p className="text-xs font-mono text-white/80 pt-2">
          {t.guarantee}
        </p>

      </div>
    </section>
  );
}
