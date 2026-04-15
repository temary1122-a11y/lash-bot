// ============================================================
// src/components/AdminSchedulePanel.jsx — Админ-панель расписания
// ============================================================

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function AdminSchedulePanel({ apiClient, adminId }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workDays, setWorkDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [daySlots, setDaySlots] = useState([]);
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
      loadClients();
    }
  }, [activeTab]);
  
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
  
  const loadWorkDays = async () => {
    try {
      setLoading(true);
      const adminId = getAdminId();
      const data = await apiClient.getWorkDays(adminId);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const filteredDays = data.filter(day => {
        const dayDate = new Date(day.day_date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      });
      
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
      const adminId = getAdminId();
      const data = await apiClient.getWorkDays(adminId);
      const dayData = data.find(d => d.day_date === date);
      setDaySlots(dayData?.slots || []);
    } catch (error) {
      console.error('Error loading day slots:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDayClick = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDay(dateStr);
    setActiveTab('slots');
    loadDaySlots(dateStr);
  };
  
  const handleAddSlot = async () => {
    if (!selectedDay || !newSlot) return;
    
    try {
      setLoading(true);
      const adminId = getAdminId();
      
      // Сначала убеждаемся что рабочий день существует
      try {
        await apiClient.addWorkDay(selectedDay, [], adminId);
      } catch (e) {
        // День уже существует - это нормально
      }
      
      // Теперь добавляем слот
      await apiClient.addTimeSlot(selectedDay, newSlot, adminId);
      setNewSlot('');
      loadDaySlots(selectedDay);
    } catch (error) {
      console.error('Error adding slot:', error);
      alert('Ошибка при добавлении слота: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSlot = async (slotTime) => {
    if (!selectedDay) return;
    
    try {
      setLoading(true);
      const adminId = getAdminId();
      await apiClient.deleteTimeSlot(selectedDay, slotTime, adminId);
      loadDaySlots(selectedDay);
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Ошибка при удалении слота');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleDay = async (date, isOpen) => {
    try {
      setLoading(true);
      const adminId = getAdminId();
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
      const adminId = getAdminId();
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Сначала пытаемся добавить рабочий день
      await apiClient.addWorkDay(
        dateStr,
        ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'],
        adminId
      );
      
      loadWorkDays();
      setSelectedDay(dateStr);
      setActiveTab('slots');
      loadDaySlots(dateStr);
    } catch (error) {
      console.error('Error adding work day:', error);
      // Если день уже существует, это не ошибка - просто переходим к слотам
      const dateStr = format(date, 'yyyy-MM-dd');
      loadWorkDays();
      setSelectedDay(dateStr);
      setActiveTab('slots');
      loadDaySlots(dateStr);
    } finally {
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
    return workDays.find(d => d.day_date === dateStr);
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
                    p-2 rounded-lg text-center cursor-pointer transition-all relative
                    ${isToday ? 'ring-2 ring-indigo-500' : ''}
                    ${status ? (
                      status.is_open 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    ) : 'bg-gray-50 hover:bg-gray-100'}
                  `}
                >
                  <div className="text-sm font-medium">{format(date, 'd')}</div>
                  {status && status.slots?.length > 0 && (
                    <div className="text-xs mt-1">
                      {status.slots.length} слот(ов)
                    </div>
                  )}
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
          
          {/* Легенда */}
          <div className="flex gap-4 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span>Открыт</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Закрыт</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded"></div>
              <span>Не рабочий</span>
            </div>
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
                  key={slot.slot_time}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{slot.slot_time}</span>
                    {slot.is_booked && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Занят
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSlot(slot.slot_time)}
                    disabled={slot.is_booked || loading}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
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
