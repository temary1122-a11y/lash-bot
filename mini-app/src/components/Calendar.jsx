// ============================================================
// src/components/Calendar.jsx — Компонент календаря (стиль MiniCal)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

export default function Calendar({ availableDates, selectedDate, onDateSelect, guiSettings, triggerHaptic, isAdmin = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedDayKey, setExpandedDayKey] = useState(null); // Single expanded day
  const calendarRef = useRef(null);

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
    setExpandedDayKey(null);
    triggerHaptic?.('light');
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setExpandedDayKey(null);
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
      case 'low': return '#9CAF88'; // sage
      case 'medium': return '#D8A7B6'; // blush
      case 'high': return '#C9979D'; // blush dark
      default: return '#C9B6A0'; // taupe
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

  const toggleExpanded = (dateStr) => {
    setExpandedDayKey(prev => (prev === dateStr ? null : dateStr));
    triggerHaptic?.('light');
  };

  // Авто-закрытие по клику вне календаря
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setExpandedDayKey(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Swipe обработчики через react-swipeable
  const handlers = useSwipeable({
    onSwipedLeft: () => goToNextMonth(),
    onSwipedRight: () => goToPreviousMonth(),
    delta: 40,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  // Форматирование месяца на русском
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <div
      ref={calendarRef}
      {...handlers}
      className="animate-fade-in"
    >
      <div
        className="
          mx-auto max-w-md rounded-[28px] p-4 border border-white/30
        "
        style={{
          background: 'rgba(245, 234, 220, 0.72)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          boxShadow: '0 8px 40px rgba(120, 80, 40, 0.18), 0 2px 0 rgba(255, 248, 240, 0.7) inset, 0 -1px 0 rgba(180, 130, 90, 0.12) inset',
        }}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button
          onClick={goToPreviousMonth}
          className="
            w-9 h-9 flex items-center justify-center rounded-2xl
            bg-warm-card/90 backdrop-blur-[20px] border border-white/50
            shadow-warm-sm text-warm-brown-2 hover:text-warm-brown
            hover:bg-warm-bg-deep/95 transition-all duration-200
          "
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
        </button>
        <span className="text-base font-semibold tracking-wide text-warm-brown">
          {format(currentMonth, 'MMMM yyyy', { locale: 'ru' })}
        </span>
        <button
          onClick={goToNextMonth}
          className="
            w-9 h-9 flex items-center justify-center rounded-2xl
            bg-warm-card/90 backdrop-blur-[20px] border border-white/50
            shadow-warm-sm text-warm-brown-2 hover:text-warm-brown
            hover:bg-warm-bg-deep/95 transition-all duration-200
          "
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest text-warm-brown-3 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <motion.div layout className="grid grid-cols-7 gap-2 sm:gap-3">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {calendarDays.map(date => {
          const available = isDateAvailable(date);
          const selected = isDateSelected(date);
          const today = isToday(date);
          const notCurrentMonth = !isSameMonth(date, currentMonth);
          const dateStr = format(date, 'yyyy-MM-dd');
          const slots = availableDatesMap.get(dateStr) || [];
          const isExpanded = expandedDayKey === dateStr;

          // Фильтрация слотов в зависимости от isAdmin
          const visibleSlots = isAdmin
            ? slots // Админ видит все слоты
            : slots.filter(slot => slot.available); // Клиент видит только свободные

          // Константа MAX_VISIBLE = 2
          const MAX_VISIBLE = 2;
          const visible = visibleSlots.slice(0, MAX_VISIBLE);
          const hidden = visibleSlots.slice(MAX_VISIBLE);
          const overflowCount = hidden.length;

          return (
            <motion.div
              key={dateStr}
              layout
              onClick={() => handleDateClick(date)}
              whileTap={{ scale: 0.96 }}
              className={`
                relative flex flex-col rounded-3xl p-2
                transition-all duration-300 ease-out cursor-pointer select-none
                border border-white/40 overflow-hidden
                ${notCurrentMonth
                  ? 'bg-warm-card/35 backdrop-blur-[16px] shadow-warm-sm opacity-55'
                  : `bg-warm-card/80 backdrop-blur-[28px]
                     shadow-[0_4px_16px_rgba(120,80,40,0.10),0_1px_0_rgba(255,248,240,0.8)_inset]
                     hover:shadow-[0_8px_24px_rgba(120,80,40,0.18),0_1px_0_rgba(255,248,240,0.8)_inset]
                     hover:bg-warm-card/95 hover:-translate-y-[1px]`
                }
                ${!available ? 'opacity-40 cursor-not-allowed' : ''}
                ${selected ? 'ring-2 ring-warm-slot-bg/70' : ''}
                ${today && !selected ? 'ring-1 ring-warm-slot-bg/40' : ''}
              `}
              style={{ minHeight: '72px' }}
            >
              {/* Верхняя строка: номер + кнопки */}
              <div className="flex items-start justify-between mb-1">
                <span
                  className={`
                    font-bold leading-none tracking-tight
                    ${visibleSlots.length > 0 ? 'text-base' : 'text-sm'}
                    ${notCurrentMonth
                      ? 'text-warm-muted'
                      : today
                        ? 'text-warm-emerald'
                        : 'text-warm-brown'
                    }
                  `}
                >
                  {format(date, 'd')}
                </span>

                {isAdmin && available && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(date);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded-full text-warm-emerald hover:text-warm-brown-2 hover:bg-warm-slot-bg/15 transition-colors"
                    aria-label="Управление слотами"
                  >
                    <Plus size={11} strokeWidth={2.8} />
                  </button>
                )}
              </div>

              {/* Слоты */}
              <div className="flex flex-col gap-[3px] flex-1">
                {visible.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAdmin && !slot.available) return;
                      handleDateClick(date, slot.time);
                    }}
                    className={`
                      w-full text-center text-xs font-semibold
                      px-2 py-[5px] rounded-2xl
                      transition-all duration-200 select-none active:scale-95
                      ${isAdmin && !slot.available
                        ? 'bg-rose-100 text-rose-700/80 border border-rose-200'
                        : 'bg-warm-slot-bg text-warm-slot-text shadow-[0_2px_6px_rgba(80,120,50,0.25)] hover:bg-warm-slot-light'
                      }
                    `}
                    style={{ backdropFilter: 'blur(4px)', letterSpacing: '0.01em' }}
                  >
                    {slot.time}
                  </button>
                ))}

                {/* + ещё N */}
                {overflowCount > 0 && !isExpanded && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(dateStr);
                    }}
                    className="text-left text-[10px] font-semibold text-warm-emerald hover:text-warm-brown-2 px-1 pt-[1px] transition-colors"
                  >
                    + ещё {overflowCount}
                  </button>
                )}

                {/* Curtain раскрытие */}
                <AnimatePresence initial={false}>
                  {isExpanded && overflowCount > 0 && (
                    <motion.div
                      key="curtain"
                      initial={{ height: 0, opacity: 0, y: -6 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -6 }}
                      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mt-1 rounded-xl bg-warm-card/80 backdrop-blur-2xl border border-white/60 p-2 shadow-[inset_0_1px_0_rgba(255,248,240,0.5)]">
                        <div className="flex flex-col gap-2">
                          {hidden.map((slot, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isAdmin && !slot.available) return;
                                handleDateClick(date, slot.time);
                              }}
                              className={`
                                w-full text-center text-xs font-semibold
                                px-2 py-[5px] rounded-2xl
                                transition-all duration-200 select-none active:scale-95
                                ${isAdmin && !slot.available
                                  ? 'bg-rose-100 text-rose-700/80 border border-rose-200'
                                  : 'bg-warm-slot-bg text-warm-slot-text shadow-[0_2px_6px_rgba(80,120,50,0.25)] hover:bg-warm-slot-light'
                                }
                              `}
                              style={{ backdropFilter: 'blur(4px)', letterSpacing: '0.01em' }}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpanded(dateStr)}
                          className="mt-2 text-xs font-medium text-warm-brown-3 hover:text-warm-brown transition"
                        >
                          Свернуть
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Стеклянный блик сверху */}
              <div
                className="absolute inset-x-0 top-0 h-[40%] rounded-t-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,248,240,0.45) 0%, rgba(255,248,240,0) 100%)',
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Легенда */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-warm-brown-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warm-slot-bg/30" />
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warm-danger/30" />
          <span>Занято</span>
        </div>
      </div>
      </div>
    </div>
  );
}
