// ============================================================
// src/components/TimeSlots.jsx — Компонент слотов времени
// ============================================================

import React from 'react';

export default function TimeSlots({ slots, selectedTime, onTimeSelect, guiSettings, triggerHaptic }) {
  const handleSlotClick = (slot) => {
    if (slot.available) {
      triggerHaptic?.('selection');
      onTimeSelect(slot.time);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-warm-text mb-4">Выберите время</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slots?.filter(slot => slot.available).map((slot) => (
          <button
            key={slot.time}
            onClick={() => handleSlotClick(slot)}
            className={`
              min-h-[56px] p-3 rounded-xl font-medium transition-all duration-200 ease-out
              flex flex-col items-center justify-center gap-1
              backdrop-blur-2xl
              ${selectedTime === slot.time
                ? 'bg-blush/25 border-2 border-blush shadow-[0_4px_16px_rgba(216,167,182,0.25)] text-blush font-semibold hover:bg-peach/30 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(216,167,182,0.3)]'
                : 'bg-white/75 border border-warm-border/50 text-warm-text hover:bg-white/[0.85] hover:border-blush/50 hover:shadow-warm-md hover:-translate-y-0.5 active:scale-[0.98]'
              }
            `}
          >
            <span className="text-base font-medium">{slot.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
