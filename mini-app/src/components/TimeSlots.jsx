// ============================================================
// src/components/TimeSlots.jsx — Компонент слотов времени
// ============================================================

import React from 'react';

export default function TimeSlots({ slots, selectedTime, onTimeSelect, guiSettings }) {
  const primaryColor = guiSettings?.primary_color || '#6366f1';
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Выберите время</h3>
      <div className="grid grid-cols-3 gap-3">
        {slots?.map((slot) => (
          <button
            key={slot.time}
            onClick={() => slot.available && onTimeSelect(slot.time)}
            disabled={!slot.available}
            className={`
              py-3 px-4 rounded-xl font-medium transition-all
              ${!slot.available 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : selectedTime === slot.time
                  ? 'text-white shadow-lg'
                  : 'bg-white hover:shadow-md'
              }
              ${slot.available && selectedTime !== slot.time ? 'hover:scale-105' : ''}
            `}
            style={{
              backgroundColor: slot.available && selectedTime === slot.time ? primaryColor : '',
            }}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
