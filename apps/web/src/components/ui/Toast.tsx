'use client';

import { useEffect, useState, useCallback } from 'react';

type ToastVariant = 'default' | 'success' | 'warning' | 'error';
type ToastLevel = 'info' | 'success' | 'warning' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  variant?: ToastVariant;
}

let toastId = 0;
const listeners = new Set<(toast: ToastMessage) => void>();

export function showToast(message: string, variant: ToastVariant = 'default') {
  const toast: ToastMessage = { id: ++toastId, message, variant };
  listeners.forEach((fn) => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [...prev.slice(-4), toast]); // Max 5 toasts
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-toast
                 flex flex-col gap-2 items-center pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDone={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDone,
}: {
  toast: ToastMessage;
  onDone: () => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 150);
    }, 2600);
    return () => clearTimeout(timer);
  }, [onDone]);

  const levelIconMap: Record<ToastLevel, string> = {
    info: '',
    success: '✓',
    warning: '!',
    error: '✕',
  };

  const variantBgMap: Record<ToastVariant, string> = {
    default: 'bg-[#1C1C1E]',
    success: 'bg-[#1D4A2F]',
    warning: 'bg-[#4A3A0A]',
    error: 'bg-[#4A1510]',
  };

  const level: ToastLevel =
    toast.variant === 'success' ? 'success'
    : toast.variant === 'warning' ? 'warning'
    : toast.variant === 'error' ? 'error'
    : 'info';

  return (
    <div
      className={`
        pointer-events-auto px-4 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium
        flex items-center gap-2 min-w-[220px] max-w-sm
        ${variantBgMap[toast.variant || 'default']}
        ${exiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
    >
      {levelIconMap[level] && (
        <span className={`text-xs font-bold ${
          level === 'success' ? 'text-emerald-400'
          : level === 'warning' ? 'text-yellow-400'
          : level === 'error' ? 'text-red-400'
          : ''
        }`}>
          {levelIconMap[level]}
        </span>
      )}
      <span>{toast.message}</span>
    </div>
  );
}
