// ============================================================
// src/components/Calendar.jsx — Компонент календаря
// ============================================================

import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ availableDates, selectedDate, onDateSelect, guiSettings }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availableDatesSet = new Set(
    availableDates?.map(d => d.date) || []
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Добавляем пустые дни для начала месяца
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isDateAvailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDatesSet.has(dateStr);
  };

  const isDateSelected = (date) => {
    return selectedDate && isSameDay(date, new Date(selectedDate));
  };

  // Форматирование месяца на русском
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {monthName} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {calendarDays.map(date => {
          const available = isDateAvailable(date);
          const selected = isDateSelected(date);
          const today = isToday(date);
          const notCurrentMonth = !isSameMonth(date, currentMonth);

          return (
            <button
              key={date.toISOString()}
              onClick={() => available && onDateSelect(format(date, 'yyyy-MM-dd'))}
              disabled={!available || notCurrentMonth}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${notCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${today ? 'ring-2 ring-primary-500' : ''}
                ${!available ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'}
                ${selected ? 'bg-primary-500 text-white' : ''}
                ${available && !selected ? 'bg-primary-50 hover:bg-primary-100' : ''}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
