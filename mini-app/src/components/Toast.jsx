// ============================================================
// src/components/Toast.jsx — Компонент уведомлений
// ============================================================

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-sage" />,
    error: <AlertCircle className="w-5 h-5 text-blush" />,
    info: <Info className="w-5 h-5 text-blush" />,
  };

  const colors = {
    success: 'border-sage bg-sage/10',
    error: 'border-blush bg-blush/10',
    info: 'border-blush bg-blush/10',
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50
      flex items-center gap-3 px-4 py-3
      rounded-xl shadow-warm-lg border-l-4 backdrop-blur-xl
      ${colors[type]}
      animate-bounce-in
      liquid-glass
    `}>
      {icons[type]}
      <span className="text-sm font-medium text-warm-text">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-warm-text-tertiary hover:text-warm-text transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
