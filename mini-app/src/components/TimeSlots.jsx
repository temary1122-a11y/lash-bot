// ============================================================
// src/components/TimeSlots.jsx — Компонент слотов времени
// ============================================================

import React from 'react';

export default function TimeSlots({ slots, selectedTime, onTimeSelect, guiSettings, triggerHaptic }) {
  const primaryColor = guiSettings?.primary_color || '#6366f1';

  const handleSlotClick = (slot) => {
    if (slot.available) {
      triggerHaptic?.('light');
      onTimeSelect(slot.time);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Выберите время</h3>
      <div className="grid grid-cols-3 gap-3">
        {slots?.filter(slot => slot.available).map((slot) => (
          <button
            key={slot.time}
            onClick={() => handleSlotClick(slot)}
            className={`
              py-3 px-4 rounded-xl font-medium transition-all
              relative overflow-hidden
              ${selectedTime === slot.time
                ? 'text-white shadow-medium transform scale-105'
                : 'bg-white hover:shadow-soft hover:scale-105 active:scale-95 border border-neutral-200'
              }
            `}
            style={{
              backgroundColor: selectedTime === slot.time ? primaryColor : '',
            }}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
