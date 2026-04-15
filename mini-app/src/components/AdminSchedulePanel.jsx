// ============================================================
// src/components/AdminSchedulePanel.jsx — Админ-панель расписания
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

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
  
  // Загрузка рабочих дней
  useEffect(() => {
    loadWorkDays();
  }, [currentMonth]);
  
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
  
  const loadWorkDays = async () => {
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
  };
  
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
    setActiveTab('slots');
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
  
  const handleToggleDay = async (date, isOpen) => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      if (isOpen) {
        await apiClient.openDay(dateStr, adminId);
      } else {
        await apiClient.closeDay(dateStr, adminId);
      }
      loadWorkDays();
    } catch (error) {
      console.error('Error toggling day:', error);
      alert('Ошибка при изменении статуса дня');
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">📅 Управление расписанием</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'calendar' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Календарь
          </button>
          <button
            onClick={() => activeTab === 'slots' && setSelectedDay(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'slots' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={!selectedDay}
          >
            Слоты
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'clients' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Клиенты
          </button>
        </div>
      </div>
      
      {activeTab === 'calendar' && (
        <>
          {/* Навигация по месяцам */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Календарь */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {WEEK_DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((date, index) => {
              const status = getWorkDayStatus(date);
              const isToday = isSameDay(date, new Date());

              if (!date) {
                return <div key={index} className="p-2" />;
              }

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(date)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (status) {
                      handleRemoveWorkDay(date);
                    } else {
                      handleAddWorkDay(date);
                    }
                  }}
                  className={`
                    min-h-[80px] rounded-xl text-center cursor-pointer transition-all relative
                    flex flex-col items-center justify-start p-1
                    ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                    ${status ? (
                      status.is_open
                        ? 'bg-white border border-green-200 hover:bg-green-50'
                        : 'bg-white border border-red-200 hover:bg-red-50'
                    ) : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                  `}
                >
                  <span className="text-xs font-bold">{format(date, 'd')}</span>

                  {/* Слоты времени прямо в дате */}
                  {status && status.slots && status.slots.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-1 w-full">
                      {status.slots.slice(0, 3).map((slot, idx) => (
                        <div
                          key={idx}
                          className={`
                            text-[10px] px-1 py-0.5 rounded text-center
                            ${slot.is_booked
                              ? 'bg-error-light text-error-dark'
                              : 'bg-success-light text-success-dark'
                            }
                          `}
                        >
                          {slot.time}
                        </div>
                      ))}
                      {status.slots.length > 3 && (
                        <div className="text-[9px] text-neutral-400 text-center">
                          +{status.slots.length - 3} ещё
                        </div>
                      )}
                    </div>
                  )}

                  {/* Индикаторы */}
                  {!status && (
                    <div className="absolute top-1 right-1">
                      <Plus className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  {status && (
                    <div className="absolute top-1 right-1">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {activeTab === 'slots' && selectedDay && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
              Вернуться к календарю
            </button>
            <h3 className="text-lg font-semibold">
              {format(new Date(selectedDay), 'dd MMMM yyyy', { locale: ru })}
            </h3>
          </div>
          
          {/* Добавление слота */}
          <div className="flex gap-2 mb-6">
            <input
              type="time"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddSlot}
              disabled={!newSlot || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>
          
          {/* Список слотов */}
          <div className="space-y-2">
            {daySlots.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Нет слотов на этот день</p>
            ) : (
              daySlots.map((slot) => (
                <div
                  key={slot.time}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{slot.time}</span>
                    {slot.is_booked && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Занят
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.time)}
                    disabled={slot.is_booked || loading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Записи клиентов */}
          {showBookings && dayBookings.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-lg font-semibold mb-4">📋 Записи клиентов</h4>
              <div className="space-y-3">
                {dayBookings.map((booking) => {
                  const service = guiSettings?.services?.find(s => s.id === booking.service_id);
                  return (
                    <div
                      key={booking.id}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {booking.username && (
                            <a
                              href={`https://t.me/${booking.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              @{booking.username}
                            </a>
                          )}
                          <div className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">{booking.client_name}</span>
                            <span className="text-gray-500"> • {booking.phone}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {booking.slot_time}
                            {service && (
                              <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs">
                                {service.name} ({service.price} ₽)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Управление статусом дня */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Статус дня:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleDay(new Date(selectedDay), true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Открыть
                </button>
                <button
                  onClick={() => handleToggleDay(new Date(selectedDay), false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Закрыть
                </button>
              </div>
            </div>
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
                <div key={client.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{client.client_name}</h4>
                      <p className="text-sm text-gray-600">{client.phone}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
