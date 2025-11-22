"use client";
import React from 'react';

export default function Modal({ open = false, onClose = () => {}, title = '', children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-700 text-white rounded-lg p-6 z-10 max-w-lg w-full">
        {title && <div className="text-lg font-semibold mb-3">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
