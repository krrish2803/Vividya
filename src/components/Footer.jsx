import React, { useState } from 'react';
import { translations } from '../data/translations';
import { Sparkles, Send, CheckCircle2, MessageSquare, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

export default function Footer({ lang, setLang }) {
  const t = translations[lang].footer;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-darkBg text-sarthiMuted pt-16 pb-12 border-t border-white/10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-gradient p-[1.5px] flex items-center justify-center shadow-lg">
                <div className="w-full h-full bg-darkBg rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sarthiPink" />
                </div>
              </div>
              <span className="font-headline font-extrabold text-xl text-white">
                Sarthi <span className="gradient-text">AI</span>
              </span>
            </div>

            <p className="text-sm text-sarthiMuted max-w-sm leading-relaxed">
              {t.tagline} Built specifically for Tier-1, Tier-2, and Tier-3 Indian college students.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <Twitter className="w-4 h-4" />, name: "Twitter" },
                { icon: <Linkedin className="w-4 h-4" />, name: "LinkedIn" },
                { icon: <Instagram className="w-4 h-4" />, name: "Instagram" },
                { icon: <MessageSquare className="w-4 h-4" />, name: "Discord" }
              ].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-darkSurface border border-white/10 flex items-center justify-center text-sarthiMuted hover:text-white hover:border-sarthiPurple hover:bg-sarthiPurple/20 transition-all"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-white uppercase tracking-wider">{t.products}</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features Overview</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">24/7 AI Tutor</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">ATS Resume Matcher</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Wellness Companion</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-white uppercase tracking-wider">{t.community}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Student Discord Server</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Placement Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hinglish AI Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Campus Ambassador Program</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-white uppercase tracking-wider">{t.newsletterTitle}</h4>
            <p className="text-xs text-sarthiMuted">Get weekly placement guides & study hacks directly in your inbox.</p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletterPlaceholder}
                  className="w-full bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-xl px-3 py-2.5 text-xs text-white placeholder-sarthiMuted outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-sarthiPurple hover:bg-sarthiPrimary text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {subscribed && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-mono animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Subscribed! Welcome to Sarthi Community.
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Copyright & Language Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <p>{t.rights}</p>

          <div className="flex items-center gap-2">
            <span className="text-sarthiMuted">Language:</span>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-sarthiPurple text-white font-bold' : 'text-sarthiMuted hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 rounded ${lang === 'hi' ? 'bg-sarthiPurple text-white font-bold' : 'text-sarthiMuted hover:text-white'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLang('hinglish')}
              className={`px-2 py-0.5 rounded ${lang === 'hinglish' ? 'bg-sarthiPurple text-white font-bold' : 'text-sarthiMuted hover:text-white'}`}
            >
              Hinglish
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
