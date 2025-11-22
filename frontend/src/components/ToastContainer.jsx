"use client";
import React from 'react';
import './toast.css';

export default function ToastContainer({ toasts = [], onClose = () => {} }) {
  return (
    <div className="toast-root" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => onClose(t.id)} aria-label="close">×</button>
        </div>
      ))}
    </div>
  );
}
