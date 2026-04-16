// ============================================================
// src/components/AdminSchedulePanel.jsx — Админ-панель расписания
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

// Version check
console.log('🚨 ADMIN PANEL v2025-04-15.23 — THIS SHOULD BE VISIBLE');
console.log('Build timestamp:', new Date().toISOString());

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function AdminSchedulePanel({ apiClient, adminId, guiSettings }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workDays, setWorkDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const selectedDayRef = useRef(null); // Критично для защиты от stale closure
  const [daySlots, setDaySlots] = useState([]);
  const [dayBookings, setDayBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar'); // calendar, slots, clients
  const [clients, setClients] = useState([]);
  const [expandedDayKey, setExpandedDayKey] = useState(null); // Single expanded day
  const calendarRef = useRef(null);
  
  // Загрузка клиентов при переключении на вкладку
  useEffect(() => {
    if (activeTab === 'clients') {
      // loadClients(); // Временно отключено - требует userId
      console.log('Clients tab disabled - needs userId');
    }
  }, [activeTab]);

  // Логирование изменений selectedDay
  useEffect(() => {
    console.log('=== selectedDay CHANGED ===');
    console.log('New selectedDay:', selectedDay);
    console.log('Active tab:', activeTab);
    selectedDayRef.current = selectedDay; // Синхронизируем ref
  }, [selectedDay]);

  /*
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMyBookings();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };
  */
  
  const loadWorkDays = useCallback(async () => {
    try {
      setLoading(true);
      console.log('=== LOADING WORK DAYS ===');
      console.log('Current month:', currentMonth);
      const data = await apiClient.getWorkDays(adminId);
      console.log('Work days data:', data);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const filteredDays = data.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      });

      console.log('Filtered work days:', filteredDays);
      setWorkDays(filteredDays);
    } catch (error) {
      console.error('Error loading work days:', error);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  // Загрузка рабочих дней
  useEffect(() => {
    loadWorkDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const loadDaySlots = async (date) => {
    try {
      setLoading(true);
      console.log('Loading day slots for:', { date, adminId });
      const data = await apiClient.getWorkDays(adminId);
      console.log('Work days data:', data);
      const dayData = data.find(d => d.date === date);
      console.log('Day data for', date, ':', dayData);
      setDaySlots(dayData?.slots || []);
    } catch (error) {
      console.error('Error loading day slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDayBookings = async (date) => {
    try {
      setLoading(true);
      const data = await apiClient.getBookingsForDate(date);
      console.log('Day bookings for', date, ':', data);
      setDayBookings(data);
    } catch (error) {
      console.error('Error loading day bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = useCallback((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log('=== DAY CLICKED ===');
    console.log('Date object:', date);
    console.log('Date string:', dateStr);
    console.log('Setting selectedDay to:', dateStr);

    setSelectedDay(dateStr);
    loadDaySlots(dateStr);
    loadDayBookings(dateStr);
    setShowBookings(true);
  }, []); // Пустые зависимости - dateStr передаётся явно
  
  const handleAddSlot = useCallback(async () => {
    const currentSelectedDay = selectedDayRef.current;

    if (!currentSelectedDay || !newSlot) {
      console.warn('No selectedDay or newSlot');
      return;
    }

    try {
      setLoading(true);
      console.log('=== ADDING SLOT ===');
      console.log('selectedDay (from ref):', currentSelectedDay);
      console.log('newSlot:', newSlot);
      console.log('adminId:', adminId);

      // Сначала убеждаемся что рабочий день существует
      try {
        await apiClient.addWorkDay(currentSelectedDay, [], adminId);
        console.log('Work day added/verified');
      } catch (e) {
        // День уже существует - это нормально
        console.log('Work day already exists or error:', e);
      }

      // Добавляем слот
      await apiClient.addTimeSlot(adminId, currentSelectedDay, newSlot);
      console.log('Time slot added successfully');
      setNewSlot('');

      // Обновляем workDays локально (без повторного запроса к API)
      setWorkDays(prev => {
        const index = prev.findIndex(d => d.date === currentSelectedDay);

        if (index >= 0) {
          // Обновляем существующий день - добавляем новый слот
          const newWorkDays = [...prev];
          const existingSlots = newWorkDays[index].slots || [];
          newWorkDays[index] = {
            ...newWorkDays[index],
            slots: [...existingSlots, { time: newSlot, is_booked: false }]
          };
          console.log('✅ Updated existing day in workDays (local)');
          return newWorkDays;
        } else {
          // Добавляем новый день (если он в текущем месяце)
          const dayDate = new Date(currentSelectedDay);
          const monthStart = startOfMonth(currentMonth);
          const monthEnd = endOfMonth(currentMonth);

          if (dayDate >= monthStart && dayDate <= monthEnd) {
            console.log('✅ Added new day to workDays (local)');
            return [...prev, {
              date: currentSelectedDay,
              is_closed: false,
              slots: [{ time: newSlot, is_booked: false }]
            }];
          } else {
            console.log('⚠️ Day outside current month, not adding to workDays');
            return prev;
          }
        }
      });

      // Обновляем слоты для отображения
      setDaySlots(prev => [...prev, { time: newSlot, is_booked: false }]);

      console.log('✅ Slot added successfully');
    } catch (error) {
      console.error('Error adding slot:', error);
      alert('Ошибка при добавлении слота: ' + (error.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  }, [newSlot, adminId, currentMonth]); // Зависимости: newSlot, adminId, currentMonth
  
  const handleDeleteSlot = useCallback(async (slotTime) => {
    const currentSelectedDay = selectedDayRef.current;

    if (!currentSelectedDay) {
      console.warn('No selectedDay');
      return;
    }

    try {
      setLoading(true);
      console.log('=== DELETING SLOT ===');
      console.log('selectedDay (from ref):', currentSelectedDay);
      console.log('slotTime:', slotTime);

      await apiClient.deleteTimeSlot(adminId, currentSelectedDay, slotTime);

      // Обновляем workDays локально (без повторного запроса к API)
      setWorkDays(prev => {
        const index = prev.findIndex(d => d.date === currentSelectedDay);
        if (index >= 0) {
          const newWorkDays = [...prev];
          const existingSlots = newWorkDays[index].slots || [];
          newWorkDays[index] = {
            ...newWorkDays[index],
            slots: existingSlots.filter(s => s.time !== slotTime)
          };
          console.log('✅ Updated day in workDays after deletion (local)');
          return newWorkDays;
        }
        return prev;
      });

      // Обновляем слоты для отображения
      setDaySlots(prev => prev.filter(s => s.time !== slotTime));

      console.log('✅ Slot deleted successfully');
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Ошибка при удалении слота');
    } finally {
      setLoading(false);
    }
  }, [adminId]); // Зависимости: adminId

  const handleAddWorkDay = async (date) => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');

      // Сначала пытаемся добавить рабочий день
      await apiClient.addWorkDay(
        dateStr,
        ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'],
        adminId
      );
    } catch (error) {
      console.error('Error adding work day:', error);
      // Если день уже существует, это не ошибка - просто продолжаем
    } finally {
      // Всегда загружаем данные и переходим к слотам
      const dateStr = format(date, 'yyyy-MM-dd');
      loadWorkDays();
      setSelectedDay(dateStr);
      setActiveTab('slots');
      loadDaySlots(dateStr);
      setLoading(false);
    }
  };
  
  const handleRemoveWorkDay = async (date) => {
    try {
      setLoading(true);
      await apiClient.deleteWorkDay(format(date, 'yyyy-MM-dd'));
      loadWorkDays();
      if (selectedDay === format(date, 'yyyy-MM-dd')) {
        setSelectedDay(null);
        setActiveTab('calendar');
      }
    } catch (error) {
      console.error('Error removing work day:', error);
      alert('Ошибка при удалении рабочего дня');
    } finally {
      setLoading(false);
    }
  };
  
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Добавляем пустые дни для начала недели
    const firstDayOfWeek = monthStart.getDay() || 7; // 1 (Пн) - 7 (Вс)
    const paddingDays = Array(firstDayOfWeek - 1).fill(null);
    
    return [...paddingDays, ...days];
  };
  
  const getWorkDayStatus = (date) => {
    if (!date) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return workDays.find(d => d.date === dateStr);
  };
  
  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setExpandedDayKey(null);
  };
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setExpandedDayKey(null);
  };

  const toggleExpanded = (dateStr) => {
    setExpandedDayKey(prev => (prev === dateStr ? null : dateStr));
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
    onSwipedRight: () => goToPrevMonth(),
    delta: 40,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });
  
  return (
  <div className="liquid-glass-heavy p-6">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-warm-text">📅 Управление расписанием</h2>
    </div>

    <div className="mb-6 w-full">
      <div className="grid grid-cols-2 gap-1 p-1.5 bg-warm-border/30 rounded-3xl w-full">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`h-11 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'calendar'
              ? 'bg-white shadow-sm text-warm-text scale-[1.02]'
              : 'text-warm-text-secondary hover:text-warm-text'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Календарь</span>
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`h-11 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'clients'
              ? 'bg-white shadow-sm text-warm-text scale-[1.02]'
              : 'text-warm-text-secondary hover:text-warm-text'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Клиенты</span>
        </button>
      </div>
    </div>

      {activeTab === 'calendar' && (
        <>
          {/* Навигация по месяцам */}
          <div ref={calendarRef} {...handlers} className="flex items-center justify-between mb-6">
            <button onClick={goToPrevMonth} className="btn-icon-warm">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={goToNextMonth} className="btn-icon-warm">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Календарь */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2">
            {WEEK_DAYS.map(day => (
              <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-warm-text-secondary py-2 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <motion.div layout className="grid grid-cols-7 gap-2 sm:gap-3">
            {getCalendarDays().map((date, index) => {
              const status = getWorkDayStatus(date);
              const today = isSameDay(date, new Date());
              const dateStr = date ? format(date, 'yyyy-MM-dd') : null;
              const isExpanded = dateStr ? expandedDayKey === dateStr : false;

              if (!date) {
                return <div key={index} className="aspect-square" />;
              }

              // Подготовка слотов
              const slots = status?.slots || [];
              const MAX_VISIBLE = 2;
              const visible = slots.slice(0, MAX_VISIBLE);
              const hidden = slots.slice(MAX_VISIBLE);
              const overflowCount = hidden.length;

              return (
                <motion.div
                  key={dateStr || index}
                  layout
                  onClick={() => handleDayClick(date)}
                  whileTap={{ scale: 0.96 }}
                  className={`
                    relative flex flex-col rounded-3xl p-4
                    bg-white/75 backdrop-blur-2xl border border-white/60
                    shadow-[0_10px_35px_-12px_rgba(180,120,100,0.25)]
                    hover:shadow-[0_15px_45px_-10px_rgba(180,120,100,0.35)]
                    hover:bg-white/85
                    min-h-[118px] sm:min-h-[124px]
                    transition-all duration-300 cursor-pointer
                    ${today ? 'ring-1 ring-[#d4b8a8]/40' : ''}
                    ${status ? 'bg-white/75' : 'opacity-40'}
                  `}
                >
                  {/* Верхняя часть: число + плюс */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-semibold text-warm-text tracking-tighter">
                      {format(date, 'd')}
                    </span>

                    {!status && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddWorkDay(date);
                        }}
                        className="text-3xl leading-none text-free-slot hover:text-emerald-600 transition-colors"
                        aria-label="Добавить рабочий день"
                      >
                        +
                      </button>
                    )}
                  </div>

                  {/* Слоты */}
                  <div className="mt-auto space-y-2">
                    {visible.map((slot, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(date);
                        }}
                        className={`
                          h-9 px-5 rounded-2xl flex items-center justify-center text-sm font-medium transition-all active:scale-95 cursor-pointer
                          ${slot.is_booked
                            ? 'bg-rose-100 text-rose-700/80 border border-rose-200'
                            : 'bg-free-slot text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-400'
                          }
                        `}
                      >
                        {slot.time}
                      </div>
                    ))}

                    {/* +N toggle (collapsed) */}
                    {overflowCount > 0 && !isExpanded && dateStr && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(dateStr);
                        }}
                        className="text-free-slot text-xs font-medium mt-2 hover:text-emerald-600 transition"
                      >
                        + ещё {overflowCount}
                      </button>
                    )}

                    {/* Curtain раскрытие: только hidden */}
                    <AnimatePresence initial={false}>
                      {isExpanded && overflowCount > 0 && dateStr && (
                        <motion.div
                          key="curtain"
                          initial={{ height: 0, opacity: 0, y: -6 }}
                          animate={{ height: "auto", opacity: 1, y: 0 }}
                          exit={{ height: 0, opacity: 0, y: -6 }}
                          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Стеклянная "шторка"-подложка */}
                          <div className="mt-1 rounded-xl bg-white/75 backdrop-blur-2xl border border-white/60 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                            <div className="flex flex-col gap-2">
                              {hidden.map((slot, idx) => (
                                <div
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDayClick(date);
                                  }}
                                  className={`
                                    h-9 px-5 rounded-2xl flex items-center justify-center text-sm font-medium transition-all active:scale-95 cursor-pointer
                                    ${slot.is_booked
                                      ? 'bg-rose-100 text-rose-700/80 border border-rose-200'
                                      : 'bg-free-slot text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-400'
                                    }
                                  `}
                                >
                                  {slot.time}
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleExpanded(dateStr)}
                              className="mt-2 text-xs font-medium text-warm-text-secondary hover:text-warm-text transition"
                            >
                              Свернуть
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}

      {/* Управление слотами выбранного дня */}
      {activeTab === 'calendar' && selectedDay && (
        <div className="mt-6 pt-6 border-t border-warm-border/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-warm-text">
              {format(new Date(selectedDay), 'dd MMMM yyyy', { locale: ru })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-sm text-warm-text-secondary hover:text-warm-text"
            >
              Закрыть
            </button>
          </div>

          {/* Добавление слота */}
          <div className="flex gap-2 mb-4">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 input-warm"
            />
            <button
              onClick={handleAddSlot}
              disabled={!newSlot || loading}
              className="btn-primary-warm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>

          {/* Список слотов */}
          <div className="space-y-2">
            {daySlots.length === 0 ? (
              <p className="text-center text-warm-text-secondary py-4">Нет слотов на этот день</p>
            ) : (
              daySlots.map((slot) => (
                <div
                  key={slot.time}
                  className="flex items-center justify-between p-3 liquid-glass rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-warm-text-tertiary" />
                    <span className="font-medium text-warm-text">{slot.time}</span>
                    {slot.is_booked && (
                      <span className="text-xs bg-blush/20 text-blush px-2 py-1 rounded">
                        Занят
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.time)}
                    disabled={slot.is_booked || loading}
                    className="btn-icon-warm text-warm-text-secondary hover:text-blush hover:bg-blush/15 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">👥 Записанные клиенты</h3>
          {clients.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Нет записанных клиентов</p>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="liquid-glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{client.client_name}</h4>
                      <p className="text-sm text-gray-600">{client.phone}</p>
                    </div>
                    <span className="text-xs bg-sage/20 text-sage px-2 py-1 rounded">
                      #{client.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {client.day_date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {client.slot_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
