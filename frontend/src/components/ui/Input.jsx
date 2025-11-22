"use client";
import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-white/4 text-white placeholder:text-gray-300 px-3 py-2 rounded-md border border-white/6 ${className}`}
      {...props}
    />
  );
}
