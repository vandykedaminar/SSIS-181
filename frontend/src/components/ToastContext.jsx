"use client";
import React, { createContext, useContext } from 'react';
import { Toaster, toast } from 'sonner';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showToast = (message, { type = 'info', duration = 4000 } = {}) => {
    if (type === 'success') toast.success(message, { duration });
    else if (type === 'error') toast.error(message, { duration });
    else if (type === 'warning' && toast.warning) toast.warning(message, { duration });
    else toast(message, { duration });
  };

  const removeToast = (id) => {
    // sonner does not expose removal by id; no-op
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <Toaster position="top-right" richColors />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
