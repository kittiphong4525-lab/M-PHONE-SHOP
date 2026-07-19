import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number, title?: string) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 4000, title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type, title, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      triggerToast(message, 'success', duration, title);
    },
    [triggerToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      triggerToast(message, 'error', duration, title);
    },
    [triggerToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      triggerToast(message, 'info', duration, title);
    },
    [triggerToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      triggerToast(message, 'warning', duration, title);
    },
    [triggerToast]
  );

  return (
    <ToastContext.Provider value={{ toast: triggerToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none p-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            let bgClass = 'bg-[#181818]/95 border-emerald-500/30 text-white';
            let progressColor = 'bg-emerald-500';
            
            if (t.type === 'error') {
              icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
              bgClass = 'bg-[#181818]/95 border-rose-500/30 text-white';
              progressColor = 'bg-rose-500';
            } else if (t.type === 'info') {
              icon = <Info className="w-5 h-5 text-sky-500 shrink-0" />;
              bgClass = 'bg-[#181818]/95 border-sky-500/30 text-white';
              progressColor = 'bg-sky-500';
            } else if (t.type === 'warning') {
              icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
              bgClass = 'bg-[#181818]/95 border-amber-500/30 text-white';
              progressColor = 'bg-amber-500';
            }

            // Detect light mode if applied globally
            const isLight = document.documentElement.classList.contains('light');
            if (isLight) {
              if (t.type === 'success') bgClass = 'bg-white border-emerald-200 text-gray-900 shadow-lg';
              else if (t.type === 'error') bgClass = 'bg-white border-rose-200 text-gray-900 shadow-lg';
              else if (t.type === 'info') bgClass = 'bg-white border-sky-200 text-gray-900 shadow-lg';
              else if (t.type === 'warning') bgClass = 'bg-white border-amber-200 text-gray-900 shadow-lg';
            }

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-xl backdrop-blur-md flex gap-3 items-start ${bgClass}`}
                id={`toast-${t.id}`}
              >
                {/* Accent indicator line on side */}
                <div className={`absolute top-0 left-0 bottom-0 w-[4px] ${progressColor}`} />
                
                {icon}
                
                <div className="flex-1 min-w-0 pr-2">
                  {t.title && (
                    <h5 className="font-bold text-sm tracking-tight leading-tight mb-1">
                      {t.title}
                    </h5>
                  )}
                  <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                    {t.message}
                  </p>
                </div>

                <button
                  onClick={() => removeToast(t.id)}
                  className={`p-1 rounded-full transition-colors shrink-0 ${
                    isLight 
                      ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-900' 
                      : 'hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  aria-label="Close toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Animated Progress bar */}
                {t.duration && t.duration > 0 && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: t.duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 right-0 h-[2px] ${progressColor} opacity-50`}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
