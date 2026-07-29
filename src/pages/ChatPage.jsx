import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../api/client';
import {
  Send, Mic, MicOff, Upload, FileText, Trash2, Sparkles,
  MessageCircle, X, Image, Loader2, StopCircle
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const prevLanguageRef = useRef(language);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (prevLanguageRef.current === language) return;
    prevLanguageRef.current = language;

    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === 'ai' && !lastMsg.content.startsWith('Error:') && !lastMsg.content.startsWith('Voice error:')) {
      const translateLastResponse = async () => {
        try {
          const res = await api.post('/chat/translate', {
            text: lastMsg.content,
            targetLanguage: language
          });
          if (res.success && res.translatedText) {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: res.translatedText
              };
              return updated;
            });
          }
        } catch (err) {
          console.error('Translation failed:', err);
        }
      };
      translateLastResponse();
    }
  }, [language, messages]);

  useEffect(() => {
    loadConversations();
    loadNotes();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.getChatHistory('tutor');
      setConversations(res.data.conversations);
    } catch {}
  };

  const loadNotes = async () => {
    try {
      const res = await api.getNotes?.() || { data: { notes: [] } };
      setNotes(res.data.notes);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { sender: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendMessage({
        message: input,
        language,
        conversationType: 'tutor',
        conversationId: activeConvo,
      });
      const aiMsg = {
        sender: 'ai',
        content: res.data.aiResponse.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (!activeConvo && res.data.conversationId) {
        setActiveConvo(res.data.conversationId);
      }
      loadConversations();
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', content: 'Error: ' + err.message, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlanFromChat = async (duration = 'weekly', topic = null) => {
    setGeneratingPlan(true);
    try {
      const res = await api.post('/timetable/generate', { duration, topic });
      if (res.success || res.plan) {
        toast.success(`${duration === 'weekly' ? 'Weekly' : 'Daily'} Study Plan generated successfully!`);
        navigate('/dashboard/timetable', { state: { tab: 'plan' } });
      } else {
        toast.error('Failed to generate study plan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating study plan.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendVoice(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoice = async (audioBlob) => {
    setLoading(true);
    const userMsg = { sender: 'user', content: '(Voice message)', timestamp: new Date(), isVoice: true };
    setMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'voice.wav');
      formData.append('language', language);
      formData.append('conversationType', 'tutor');
      if (activeConvo) {
        formData.append('conversationId', activeConvo);
      }

      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/chat/voice', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const aiMsg = {
        sender: 'ai',
        content: data.data.aiResponse.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      if (!activeConvo && data.data.conversationId) {
        setActiveConvo(data.data.conversationId);
      }
      loadConversations();
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', content: 'Voice error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const uploadNote = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', 'General');

      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/notes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setNotes(prev => [data.data, ...prev]);
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: `Notes uploaded! Summary: ${data.data.summary}\n\nKey Points:\n${data.data.keyPoints.map(p => '• ' + p).join('\n')}`,
        timestamp: new Date(),
      }]);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quickPrompts = [
    'Explain photosynthesis in simple terms',
    'How to prepare for placement interviews?',
    'Tips for managing exam stress',
    'Best resources to learn DSA',
  ];

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Conversations Sidebar */}
      <div className="hidden md:flex w-64 bg-darkSurface border-r border-white/10 flex-col">
        <div className="p-3 border-b border-white/10">
          <h3 className="text-xs font-mono font-bold text-sarthiMuted uppercase tracking-wider">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-sarthiMuted p-2">No conversations yet</p>
          )}
          {conversations.map((c, i) => (
            <button
              key={c._id}
              onClick={() => {
                setActiveConvo(c._id);
                setMessages(c.messages.map(m => ({
                  sender: m.sender,
                  content: m.content,
                  timestamp: m.timestamp,
                })));
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                activeConvo === c._id ? 'bg-sarthiPurple/30 text-white' : 'text-sarthiMuted hover:bg-white/5'
              }`}
            >
              <p className="truncate font-medium">{c.messages?.[0]?.content || 'New conversation'}</p>
              <p className="text-[10px] text-sarthiMuted mt-0.5">{new Date(c.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => { setMessages([]); setActiveConvo(null); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sarthiPurple/20 text-sarthiPurple text-xs font-medium hover:bg-sarthiPurple/30 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> New Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Language Toggle */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-sarthiMuted font-mono mr-1">Language:</span>
          {[
            { code: 'en', label: 'English', flag: '🌐' },
            { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
            { code: 'hi-en', label: 'Hinglish', flag: '💬' },
            { code: 'mr', label: 'Marathi', flag: '🏛️' },
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                language === lang.code
                  ? 'bg-sarthiPurple text-white shadow-lg shadow-sarthiPrimary/30'
                  : 'bg-darkSurface border border-white/10 text-sarthiMuted hover:text-white hover:border-sarthiPurple/50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/notes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sarthiGold/20 text-sarthiGold text-xs font-medium hover:bg-sarthiGold/30 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Notes
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-sarthiMuted text-xs font-medium hover:bg-white/10 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Notes ({notes.length})
            </button>
          </div>
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="border-b border-white/10 bg-darkSurface/50 p-4 max-h-48 overflow-y-auto">
            <h4 className="text-xs font-mono font-bold text-sarthiMuted mb-2">Uploaded Notes</h4>
            {notes.length === 0 ? (
              <p className="text-xs text-sarthiMuted">No notes uploaded yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {notes.map((note, i) => (
                  <div key={i} className="p-2 rounded-lg bg-darkBg border border-white/10 text-xs">
                    <p className="text-white font-medium truncate">{note.filename}</p>
                    <p className="text-sarthiMuted mt-1 line-clamp-2">{note.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-gradient p-[1.5px]">
                <div className="w-full h-full bg-darkBg rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-sarthiPink" />
                </div>
              </div>
              <h3 className="font-headline font-bold text-xl text-white">Ask Vividya AI</h3>
              <p className="text-sm text-sarthiMuted max-w-md">
                Your AI tutor for academics, career guidance, and wellness. Ask anything in English, Hindi, or Hinglish.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-left p-3 rounded-xl bg-darkSurface border border-white/10 text-xs text-sarthiMuted hover:text-white hover:border-sarthiPurple/50 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-primary-gradient text-white'
                  : 'bg-darkSurface border border-white/10 text-sarthiText'
              }`}>
                {msg.isVoice && (
                  <div className="flex items-center gap-1 text-xs text-sarthiMuted mb-1">
                    <Mic className="w-3 h-3" /> Voice message
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                 {msg.sender === 'ai' && !msg.content.startsWith('Error:') && !msg.content.startsWith('Voice error:') && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
                    <button
                      onClick={() => handleGeneratePlanFromChat('weekly', msg.content)}
                      disabled={generatingPlan}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sarthiPurple/20 text-sarthiPurple hover:bg-sarthiPurple/30 transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Weekly Plan
                    </button>
                    <button
                      onClick={() => handleGeneratePlanFromChat('daily', msg.content)}
                      disabled={generatingPlan}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sarthiGold/20 text-sarthiGold hover:bg-sarthiGold/30 transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Daily Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-darkSurface border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sarthiMuted text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vividya is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-darkSurface border border-white/10 text-sarthiMuted hover:text-white'
              }`}
            >
              {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? 'Recording...' : 'Type your question...'}
              disabled={loading || isRecording}
              className="flex-1 bg-darkSurface border border-white/10 focus:border-sarthiPurple rounded-xl px-4 py-3 text-sm text-white placeholder-sarthiMuted/60 outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 rounded-xl bg-sarthiPurple hover:bg-sarthiPrimary text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
