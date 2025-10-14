"use client";

import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  duration?: number; // milisegundos
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null; // evita renderizar si el mensaje está vacío

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center bg-white border border-slate-300 shadow-lg rounded-lg px-4 py-3 animate-fade-in">
      <p className="text-slate-800 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-slate-500 hover:text-slate-800 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
