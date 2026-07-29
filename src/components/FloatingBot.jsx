import React, { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, User, Bot, PhoneCall } from 'lucide-react';

export default function FloatingBot({ lang }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: lang === 'hi' 
        ? "नमस्ते! मैं आपका AI सारथी हूं। पढ़ाई, करियर या तनाव से जुड़ा कोई भी सवाल पूछें!"
        : "Namaste! I am your AI Sarthi. Ask me anything about study notes, placement tips, or stress relief in English or Hinglish!"
    }
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      let botResp = "Sarthi Tip: Focus on core DSA, build 2 clean projects, and scan your resume on our ATS module. You've got this! 🚀";
      if (userText.toLowerCase().includes('placement') || userText.toLowerCase().includes('job')) {
        botResp = "Placement Advice: 1. Practice 1 LeetCode Medium daily. 2. Tailor your resume keywords. 3. Sarthi's Career Navigator can scan your resume right now!";
      } else if (userText.toLowerCase().includes('stress') || userText.toLowerCase().includes('tension')) {
        botResp = "Take a deep breath! Try our 1-minute Box Breathing exercise in the Wellness section above. Stress is temporary, your potential is permanent. ❤️";
      }

      setChatHistory(prev => [...prev, { sender: 'bot', text: botResp }]);
    }, 700);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Expanded Widget Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 glass-card rounded-2xl border border-sarthiPurple/40 shadow-2xl bg-darkSurface/95 flex flex-col overflow-hidden animate-fade-in">
          
          {/* Top Bar */}
          <div className="p-4 bg-darkBg border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sarthiGold animate-pulse" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-white text-xs">Sarthi AI Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online • Offline LLM Ready
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-sarthiMuted hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="p-4 h-64 overflow-y-auto space-y-3 bg-darkBg/60 text-xs">
            {chatHistory.map((c, i) => (
              <div
                key={i}
                className={`flex gap-2 ${c.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {c.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-sarthiPurple flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl leading-relaxed max-w-[80%] ${
                    c.sender === 'user'
                      ? 'bg-sarthiPurple text-white rounded-br-none'
                      : 'bg-darkSurface text-sarthiText border border-white/10 rounded-bl-none'
                  }`}
                >
                  {c.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-darkBg flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Sarthi in EN/HI/Hinglish..."
              className="flex-1 bg-darkSurface border border-white/15 focus:border-sarthiPurple rounded-xl px-3 py-2 text-xs text-white placeholder-sarthiMuted outline-none"
            />
            <button
              type="submit"
              className="px-3 bg-primary-gradient text-white font-bold rounded-xl text-xs flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-4 py-3.5 rounded-full bg-primary-gradient text-white shadow-2xl shadow-sarthiPurple/50 hover:scale-105 transition-all duration-200"
      >
        <Sparkles className="w-5 h-5 text-sarthiGold fill-sarthiGold animate-spin-slow" />
        <span className="font-headline font-bold text-xs">Ask Sarthi AI</span>
        
        {/* Unread dot */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sarthiPink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sarthiPink"></span>
          </span>
        )}
      </button>

    </div>
  );
}
