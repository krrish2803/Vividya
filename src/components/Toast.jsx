import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react';

const ToastContext = createContext(null);

const toastIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
  ai: Sparkles,
};

const toastColors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  ai: 'border-sarthiPurple/30 bg-sarthiPurple/10',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  ai: 'text-sarthiPurple',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
    ai: (msg) => addToast(msg, 'ai'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = toastIcons[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`pointer-events-auto glass-card border ${toastColors[t.type]} rounded-2xl p-4 flex items-start gap-3 max-w-sm shadow-2xl backdrop-blur-xl`}
              >
                <Icon className={`w-5 h-5 ${iconColors[t.type]} flex-shrink-0 mt-0.5`} />
                <p className="text-sm text-sarthiText flex-1">{t.message}</p>
                <button onClick={() => removeToast(t.id)}
                  className="text-sarthiMuted hover:text-white transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
