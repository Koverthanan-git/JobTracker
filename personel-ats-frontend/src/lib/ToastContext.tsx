"use client"
import React, { createContext, useContext, useState } from 'react';

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error' };

const ToastContext = createContext<{ showToast: (message: string, type?: Toast['type']) => void } | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((t) => [{ id, message, type }, ...t]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '10px 14px', borderRadius: 10, background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#ecfccb' : '#eef2ff', color: '#0f172a', boxShadow: '0 6px 20px rgba(2,6,23,0.08)', minWidth: 200 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.type?.toUpperCase()}</div>
            <div style={{ fontSize: 13 }}>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
