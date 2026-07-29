import React, { useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, CheckCircle, Sparkles, MessageSquare, FileText, Heart, Shield } from 'lucide-react';

export default function VideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const chapters = [
    { title: "0:00 - Introduction to Vividya AI", desc: "Why Indian students need a personalized guide", icon: "🚀" },
    { title: "0:45 - Live Doubt Solving in Hinglish", desc: "Asking physics & coding doubts naturally", icon: "💬" },
    { title: "1:15 - ATS Resume & Placement Scanner", desc: "Analyzing real market skills for Tier-2 college", icon: "📄" },
    { title: "1:50 - Mental Wellness & Breathing Guide", desc: "Exam stress detection & guided wellness", icon: "❤️" },
    { title: "2:15 - Offline Hostel Mode Test", desc: "Using local LLM without internet connection", icon: "⚡" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-darkSurface rounded-2xl border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-darkBg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-sarthiGold" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-white text-base">Vividya AI — Product Demo Walkthrough (2:30)</h3>
              <p className="text-xs text-sarthiMuted">Real Indian student using Vividya for placement prep & mental peace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sarthiMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Canvas Simulation Area */}
        <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden">
          
          {/* Simulated Video Content Screen */}
          <div className="absolute inset-0 bg-gradient-to-br from-darkBg via-darkSurface to-sarthiPurple/30 flex flex-col items-center justify-center p-6 text-center">
            
            {/* Dynamic Content based on Chapter */}
            <div className="max-w-md space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-sarthiPurple/30 border border-sarthiPurple/50 flex items-center justify-center text-3xl mx-auto shadow-xl">
                {chapters[activeChapter].icon}
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-sarthiPink/20 text-sarthiPink text-xs font-mono font-bold border border-sarthiPink/30">
                CHAPTER {activeChapter + 1} OF 5
              </div>

              <h4 className="font-headline font-bold text-2xl text-white">
                {chapters[activeChapter].title.split('-')[1]}
              </h4>

              <p className="text-sm text-sarthiMuted">
                {chapters[activeChapter].desc}
              </p>

              {/* Mock Student Speech Bubble simulation */}
              <div className="p-3.5 rounded-xl bg-darkBg/90 border border-white/10 text-left text-xs space-y-1">
                <span className="text-sarthiGold font-bold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Student Priya (Tier-2 CSE):
                </span>
                <p className="text-sarthiText italic">
                  {activeChapter === 0 && '"Mujhe placement ke liye tension ho rahi thi, par Vividya ne exact 60-day roadmap de diya!"'}
                  {activeChapter === 1 && '"Hinglish mein doubt pucha: Dynamic Programming easy step-by-step kaise samjhein?"'}
                  {activeChapter === 2 && '"Resume upload karte hi ATS score 88/100 aaya aur suggested keywords suggest kiye!"'}
                  {activeChapter === 3 && '"Exam nights par Vividya ka wellness check-in sach mein calm rakhta hai."'}
                  {activeChapter === 4 && '"Hostel mein Wi-Fi off hua, fir bhi Vividya offline LLM seamless chal raha tha!"'}
                </p>
              </div>
            </div>

            {/* Video Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 rounded-full bg-sarthiPurple hover:bg-sarthiPrimary text-white flex items-center justify-center transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-sarthiMuted hover:text-white p-1"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-sarthiAlert" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <span className="text-xs font-mono text-sarthiMuted">
                  {activeChapter === 0 ? "0:15 / 2:30" : activeChapter === 1 ? "0:50 / 2:30" : "1:40 / 2:30"}
                </span>
              </div>

              <span className="text-xs font-mono bg-sarthiGold/20 text-sarthiGold px-2 py-0.5 rounded border border-sarthiGold/30">
                1080p HD • Demo
              </span>
            </div>

          </div>

        </div>

        {/* Chapter Selection Bar */}
        <div className="p-4 bg-darkBg border-t border-white/10 overflow-x-auto">
          <p className="text-xs font-mono text-sarthiMuted mb-2">JUMP TO DEMO CHAPTERS:</p>
          <div className="flex gap-2">
            {chapters.map((chap, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChapter(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all shrink-0 flex items-center gap-2 ${
                  activeChapter === idx
                    ? 'bg-sarthiPurple text-white border-sarthiPurple shadow-lg'
                    : 'bg-darkSurface text-sarthiMuted border-white/10 hover:text-white'
                }`}
              >
                <span>{chap.icon}</span>
                <span className="font-semibold">{chap.title.split('-')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
