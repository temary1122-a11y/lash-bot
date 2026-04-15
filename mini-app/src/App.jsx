// ============================================================
// src/App.jsx — Главный компонент Mini App
// ============================================================

import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import AdminPanel from './components/AdminPanel';
import { apiClient } from './api/client';
import { Calendar as CalendarIcon, Settings, Menu } from 'lucide-react';

// Admin ID - должен совпадать с ADMIN_ID в .env
const ADMIN_ID = 8736987138;

export default function App() {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [guiSettings, setGuiSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Telegram WebApp integration
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram?.WebApp;
      const userId = tg?.initDataUnsafe?.user?.id || 0;
      const adminCheck = userId === ADMIN_ID;
      console.log('Telegram WebApp userId:', userId, 'ADMIN_ID:', ADMIN_ID, 'adminCheck:', adminCheck);
      setIsAdmin(adminCheck);
      // Админ видит админ-панель по умолчанию
      setShowAdmin(adminCheck);
      tg.ready();
      tg.expand();
    } else {
      // Если открыто не через Telegram, разрешаем админ-режим
      console.log('Not opened via Telegram, setting admin mode');
      setIsAdmin(true);
      setShowAdmin(true);
    }
  }, []);
  
  // Загрузка данных
  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading data, isAdmin:', isAdmin);
      
      // Загружаем только GUI settings для всех
      const settings = await apiClient.getGUISettings().catch(e => {
        console.error('Error loading settings:', e);
        return null;
      });
      setGuiSettings(settings || {
        background_color: '#ffffff',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        text_color: '#1f2937',
        calendar_style: 'modern',
        background_image: null
      });

      // Загружаем клиентские данные только если не админ
      if (!isAdmin) {
        console.log('Loading client data (available dates)');
        const dates = await apiClient.getAvailableDates().catch(e => {
          console.error('Error loading dates:', e);
          return [];
        });
        setAvailableDates(dates || []);
      } else {
        console.log('Skipping client data loading (admin mode)');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowBookingForm(false);
    
    // Находим слоты для выбранной даты
    const dayData = availableDates.find(d => d.date === date);
    if (dayData && dayData.slots.length > 0) {
      // Автоматически выбираем первый доступный слот
      const firstAvailable = dayData.slots.find(s => s.available);
      if (firstAvailable) {
        setSelectedTime(firstAvailable.time);
      }
    }
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowBookingForm(true);
  };
  
  const handleBookingSubmit = async (formData) => {
    try {
      const response = await apiClient.createBooking({
        date: selectedDate,
        time: selectedTime,
        name: formData.name,
        phone: formData.phone,
      });
      
      if (response.success) {
        alert('Запись успешно создана!');
        setShowBookingForm(false);
        setSelectedDate(null);
        setSelectedTime(null);
        loadData(); // Перезагружаем данные
      } else {
        alert(`Ошибка: ${response.message}`);
      }
    } catch (error) {
      alert('Ошибка при создании записи');
    }
  };
  
  const handleSettingsUpdate = (newSettings) => {
    setGuiSettings(newSettings);
  };
  
  // Применяем настройки GUI
  useEffect(() => {
    if (guiSettings) {
      document.body.style.backgroundColor = guiSettings.background_color;
      if (guiSettings.background_image) {
        document.body.style.backgroundImage = `url(${guiSettings.background_image})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
      }
    }
  }, [guiSettings]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: guiSettings?.background_color || '#ffffff' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" style={{ color: guiSettings?.primary_color }} />
          <h1 className="text-xl font-bold text-gray-800">
            {showAdmin ? 'Админ-панель' : 'Запись на наращивание'}
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: showAdmin ? guiSettings?.primary_color : '#f3f4f6',
              color: showAdmin ? '#ffffff' : '#374151'
            }}
          >
            {showAdmin ? '👤 Клиентский вид' : '⚙️ Админ-панель'}
          </button>
        )}
      </div>
      
      {showAdmin ? (
        <AdminPanel
          guiSettings={guiSettings}
          onSettingsUpdate={handleSettingsUpdate}
        />
      ) : (
        <>
          {/* Кнопка для входа в админ-режим (всегда видна) */}
          <div className="mb-4">
            <button
              onClick={() => {
                setIsAdmin(true);
                setShowAdmin(true);
              }}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              ⚙️ Войти в админ-панель
            </button>
          </div>
          
          {availableDates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="text-gray-600">Нет доступных дат для записи.</p>
              <p className="text-sm text-gray-500 mt-2">Добавьте рабочие дни через админ-панель.</p>
            </div>
          ) : (
            <>
              <Calendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                guiSettings={guiSettings}
              />

              {selectedDate && (
                <TimeSlots
                  slots={availableDates.find(d => d.date === selectedDate)?.slots || []}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  guiSettings={guiSettings}
                />
              )}

              {showBookingForm && selectedDate && selectedTime && (
                <BookingForm
                  date={selectedDate}
                  time={selectedTime}
                  onSubmit={handleBookingSubmit}
                  guiSettings={guiSettings}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
