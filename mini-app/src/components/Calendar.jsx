// ============================================================
// src/components/Calendar.jsx — Компонент календаря (стиль MiniCal)
// ============================================================

import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar({ availableDates, selectedDate, onDateSelect, guiSettings, triggerHaptic }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const availableDatesMap = new Map(
    availableDates?.map(d => [d.date, d.slots || []]) || []
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Добавляем пустые дни для начала месяца
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null);

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    triggerHaptic?.('light');
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    triggerHaptic?.('light');
  };

  const isDateAvailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDatesMap.has(dateStr);
  };

  const isDateSelected = (date) => {
    return selectedDate && isSameDay(date, new Date(selectedDate));
  };

  const getBookingCount = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slots = availableDatesMap.get(dateStr) || [];
    return slots.filter(s => !s.available).length;
  };

  const getTotalSlots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDatesMap.get(dateStr)?.length || 0;
  };

  const getLoadLevel = (date) => {
    const booked = getBookingCount(date);
    const total = getTotalSlots(date);
    if (total === 0) return 'empty';
    const ratio = booked / total;
    if (ratio < 0.3) return 'low';
    if (ratio < 0.7) return 'medium';
    return 'high';
  };

  const getLoadColor = (level) => {
    switch (level) {
      case 'low': return '#22c55e'; // green-500
      case 'medium': return '#eab308'; // yellow-500
      case 'high': return '#ef4444'; // red-500
      default: return '#d1d5db'; // gray-300
    }
  };

  const handleDateClick = (date, timeSlot = null) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (isDateAvailable(date)) {
      triggerHaptic?.('medium');
      // Если передано время слота, сразу передаём его
      onDateSelect(dateStr, timeSlot);
    }
  };

  // Форматирование месяца на русском
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="btn-ghost"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">
          {monthName} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="btn-ghost"
        >
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
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
          const slots = availableDatesMap.get(format(date, 'yyyy-MM-dd')) || [];

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={!available || notCurrentMonth}
              className={`
                min-h-[80px] rounded-xl text-sm font-medium transition-all
                relative flex flex-col items-center justify-start p-1
                ${notCurrentMonth ? 'text-neutral-200' : 'text-neutral-700'}
                ${today ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                ${!available ? 'opacity-20 cursor-not-allowed bg-neutral-50' : 'hover:bg-neutral-50 active:scale-95'}
                ${selected ? 'bg-primary-500 text-white shadow-medium' : ''}
                ${available && !selected ? 'bg-white border border-neutral-200' : ''}
              `}
            >
              <span className="text-xs font-bold">{format(date, 'd')}</span>

              {/* Слоты времени прямо в дате (только свободные) */}
              {available && slots.length > 0 && (
                <div className="flex flex-col gap-0.5 mt-1 w-full">
                  {slots
                    .filter(slot => slot.available)
                    .slice(0, 3)
                    .map((slot, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(date, slot.time);
                      }}
                      className={`
                        text-[10px] px-1 py-0.5 rounded text-center cursor-pointer
                        ${selected ? 'bg-primary-400 text-white hover:bg-primary-500' : 'bg-success-light text-success-dark hover:bg-success-DEFAULT'}
                      `}
                    >
                      {slot.time}
                    </div>
                  ))}
                  {slots.filter(slot => slot.available).length > 3 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onDateSelect(format(date, 'yyyy-MM-dd'));
                      }}
                      className="text-[9px] text-primary-500 text-center cursor-pointer hover:underline"
                    >
                      +{slots.filter(slot => slot.available).length - 3} ещё
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Легенда */}
      <div className="flex items-center justify-center gap-4 mt-6 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success-light" />
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-error-light" />
          <span>Занято</span>
        </div>
      </div>
    </div>
  );
}
