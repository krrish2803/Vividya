import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFileUpload, FaSearch, FaDatabase, FaRobot, FaFileAlt, FaLightbulb } from 'react-icons/fa';

const suggestions = [
  'Explain deep learning in simple terms...',
  'What is the difference between ML and DL?',
  'How does backpropagation work?',
  'Explain the concept of gradient descent.',
  'What are neural networks and how do they learn?',
  'Compare supervised vs unsupervised learning.',
  'What is overfitting and how to prevent it?',
  'Explain convolutional neural networks (CNNs).',
];

export default function RAGNotesPage() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [ragNoteId, setRagNoteId] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const typingTimeout = useRef(null);
  const fileInputRef = useRef(null);

  // Rotating placeholder typing effect
  useEffect(() => {
    const current = suggestions[placeholderIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedPlaceholder('');

    const typeChar = () => {
      if (charIndex <= current.length) {
        setDisplayedPlaceholder(current.slice(0, charIndex));
        charIndex++;
        typingTimeout.current = setTimeout(typeChar, 40 + Math.random() * 30);
      } else {
        setIsTyping(false);
        typingTimeout.current = setTimeout(() => {
          // Start erasing
          let eraseIndex = current.length;
          const eraseChar = () => {
            if (eraseIndex >= 0) {
              setDisplayedPlaceholder(current.slice(0, eraseIndex));
              eraseIndex--;
              typingTimeout.current = setTimeout(eraseChar, 20);
            } else {
              setPlaceholderIndex(prev => (prev + 1) % suggestions.length);
            }
          };
          eraseChar();
        }, 2500);
      }
    };

    typeChar();
    return () => clearTimeout(typingTimeout.current);
  }, [placeholderIndex]);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await api.get('/rag/docs');
      setDocs(res.docs || []);
    } catch (err) { console.error(err); }
  };

  const handleUpload = async (e) => {
    let files = [];
    if (e.target?.files) {
      files = Array.from(e.target.files);
      e.target.value = '';
    } else if (Array.isArray(e)) {
      files = e;
    } else if (e instanceof File) {
      files = [e];
    } else if (e.length) {
      files = Array.from(e);
    }

    if (files.length === 0) return;
    setUploading(true);
    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const uploadRes = await api.post('/notes/upload', formData);
          const noteId = uploadRes.data?.noteId || uploadRes.noteId;
          if (noteId) {
            await api.post('/rag/index', { noteId });
          }
        })
      );
      await loadDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleUpload(files);
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    setQuerying(true);
    try {
      const res = await api.post('/rag/query', { query, language: i18n.language });
      setAnswer(res.answer);
      setSources(res.sources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setQuerying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <FaDatabase className="text-blue-400" /> {t('Smart Notes')}
      </h1>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <FaFileUpload className="text-purple-400 text-xl" />
          <h2 className="text-lg font-semibold text-white">{t('Upload Notes')}</h2>
        </div>
        <p className="text-gray-400 text-sm">{t('Upload PDFs or images of your notes. AI will index them for smart Q&A.')}</p>
        <div className="block">
          <input type="file" ref={fileInputRef} accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleUpload} onClick={(e) => e.stopPropagation()} className="hidden" multiple />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
              uploading
                ? 'border-blue-500 bg-blue-500/10'
                : isDragging
                ? 'border-sarthiPurple bg-sarthiPurple/15 scale-[1.02] shadow-lg shadow-sarthiPurple/20'
                : 'border-white/20 hover:border-sarthiPurple hover:bg-sarthiPurple/5'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-blue-400 font-medium">{t('Uploading & indexing...')}</p>
              </div>
            ) : isDragging ? (
              <div className="flex flex-col items-center gap-2">
                <FaFileUpload className="text-4xl text-sarthiPurple animate-bounce" />
                <p className="text-sarthiPurple font-medium">Drop your file here</p>
                <p className="text-xs text-sarthiMuted">PDF, PNG, JPG, WebP up to 10MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FaFileUpload className="text-3xl text-gray-400" />
                <p className="text-gray-400">{t('Click to upload or drag and drop')}</p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG, WebP</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {docs.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><FaFileAlt className="text-green-400" /> {t('Indexed Documents')}</h2>
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white text-sm">{doc.filename}</span>
                <span className="text-gray-500 text-xs">{doc.chunks} {t('chunks')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <FaRobot className="text-purple-400 text-xl" />
          <h2 className="text-lg font-semibold text-white">{t('Ask Questions')}</h2>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 4).map((s, i) => (
            <button key={i} onClick={() => { setQuery(s.replace('...', '')); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-sarthiMuted hover:text-white hover:border-sarthiPurple/50 hover:bg-sarthiPurple/10 transition-all">
              <FaLightbulb className="w-3 h-3 text-sarthiGold" />
              {s.replace('...', '')}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
            onFocus={() => clearTimeout(typingTimeout.current)}
            placeholder={query ? '' : displayedPlaceholder}
            className="flex-1 bg-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-sarthiPurple outline-none transition-colors border border-transparent" />
          <button onClick={handleQuery} disabled={querying}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
            <FaSearch /> {querying ? t('Thinking...') : t('Ask')}
          </button>
        </div>
      </div>

      {answer && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <FaRobot className="text-purple-400" />
            <h3 className="font-semibold text-white">{t('AI Answer')}</h3>
          </div>
          <p className="text-gray-200 whitespace-pre-wrap">{answer}</p>
          {sources.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-xs text-gray-500 mb-2">{t('Sources')}:</p>
              {sources.map((s, i) => (
                <p key={i} className="text-xs text-gray-400">#{i + 1} — {s.score.toFixed(3)} {t('relevance')} · {s.metadata?.filename || t('Unknown')}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
