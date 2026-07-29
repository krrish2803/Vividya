import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, User, Mail, GraduationCap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({ isOpen, onClose, lang }) {
  if (!isOpen) return null;

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    stream: 'CSE'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-darkSurface rounded-2xl border border-white/15 shadow-2xl overflow-hidden p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-sarthiMuted hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary-gradient p-[1.5px] flex items-center justify-center mx-auto shadow-xl">
                <div className="w-full h-full bg-darkBg rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-sarthiPink" />
                </div>
              </div>
              
              <h3 className="font-headline font-bold text-xl text-white">
                Start Your Free Sarthi AI Journey
              </h3>
              <p className="text-xs text-sarthiMuted">
                Join 10,000+ Indian students. No credit card required.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-sarthiMuted font-mono">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white placeholder-sarthiMuted outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sarthiMuted font-mono">Student Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@college.edu.in"
                    className="w-full pl-9 pr-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white placeholder-sarthiMuted outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sarthiMuted font-mono">College / University Name</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. BITS / Tier-2 Engg College"
                    className="w-full pl-9 pr-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white placeholder-sarthiMuted outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sarthiMuted font-mono">Branch / Stream</label>
                <select
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full px-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white outline-none"
                >
                  <option value="CSE">B.Tech Computer Science (CSE/IT)</option>
                  <option value="ECE">B.Tech ECE / EEE</option>
                  <option value="MECH">B.Tech Mechanical / Civil</option>
                  <option value="BCOM">B.Com / BBA / MBA</option>
                  <option value="BSC">B.Sc / BCA / MCA</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-gradient text-white font-headline font-bold rounded-xl shadow-xl shadow-sarthiPrimary/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-2"
              >
                <span>🚀 Launch Sarthi AI Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-headline font-extrabold text-2xl text-white">
              Welcome aboard, {formData.name || 'Student'}! 🎉
            </h3>

            <p className="text-xs text-sarthiMuted max-w-xs mx-auto leading-relaxed">
              Your free Sarthi account for <strong>{formData.college || 'your college'}</strong> has been created. Instant access to offline LLMs and RAG doubt solver activated.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-sarthiPurple hover:bg-sarthiPrimary text-white font-bold text-xs transition-colors"
            >
              Continue to Sarthi AI
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
