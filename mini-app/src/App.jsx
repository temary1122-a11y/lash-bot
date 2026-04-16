// ============================================================
// src/App.jsx — Главный компонент Mini App
// ============================================================

import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import { apiClient } from './api/client';
import { Calendar as CalendarIcon, Settings, Menu, Sun, Moon } from 'lucide-react';

// Version check
console.log('🚨 LASH MINI APP ROOT v2025-04-15.23 LOADED');
console.log('Build timestamp:', new Date().toISOString());

// Хук для определения темы Telegram
const useTelegramTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      // Получить текущую тему
      const colorScheme = tg.colorScheme || 'light';
      setTheme(colorScheme);

      // Слушать изменения темы
      const handleThemeChange = () => {
        setTheme(tg.colorScheme || 'light');
      };

      tg.onEvent('themeChanged', handleThemeChange);

      return () => {
        tg.offEvent('themeChanged', handleThemeChange);
      };
    }
  }, []);

  return theme;
};

// Admin ID - должен совпадать с ADMIN_ID в .env
const ADMIN_ID = 8736987138;

// Функция вибрации для Telegram Mini App
export const triggerHaptic = (type = 'light') => {
  if (window.Telegram?.WebApp?.HapticFeedback) {
    switch (type) {
      case 'light':
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        break;
      case 'success':
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        break;
      case 'error':
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        break;
      default:
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  } else if (navigator.vibrate) {
    // Fallback для обычного браузера
    navigator.vibrate(type === 'heavy' ? 200 : type === 'medium' ? 100 : 50);
  }
};

// Функция для запроса контакта через Telegram
export const requestContact = () => {
  return new Promise((resolve, reject) => {
    if (window.Telegram?.WebApp?.requestContact) {
      window.Telegram.WebApp.requestContact((contact) => {
        if (contact) {
          resolve({
            phone: contact.phone_number,
            firstName: contact.first_name,
            lastName: contact.last_name,
          });
        } else {
          reject(new Error('Contact request cancelled'));
        }
      });
    } else {
      reject(new Error('Telegram WebApp not available'));
    }
  });
};

export default function App() {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [guiSettings, setGuiSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Telegram theme detection
  const telegramTheme = useTelegramTheme();

  // Применяем тему Telegram
  useEffect(() => {
    if (telegramTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, [telegramTheme]);

  // Переключение темы вручную
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    triggerHaptic('light');
  };

  // Telegram WebApp integration
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram?.WebApp;
      const userId = tg?.initDataUnsafe?.user?.id || 0;
      // Если userId == 0, считаем что это админ (fallback для проблем с Telegram WebApp)
      const adminCheck = userId === ADMIN_ID || userId === 0;
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
  
  const handleDateSelect = (date, timeSlot = null) => {
    setSelectedDate(date);
    setSelectedTime(timeSlot);

    // Если время не передано, находим первый доступный слот и скрываем форму
    if (!timeSlot) {
      setShowBookingForm(false);
      const dayData = availableDates.find(d => d.date === date);
      if (dayData && dayData.slots.length > 0) {
        const firstAvailable = dayData.slots.find(s => s.available);
        if (firstAvailable) {
          setSelectedTime(firstAvailable.time);
        }
      }
    } else {
      // Если время передано, сразу показываем форму записи
      setShowBookingForm(true);
    }
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowBookingForm(true);
  };
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleBookingSubmit = async (formData) => {
    try {
      const response = await apiClient.createBooking({
        date: selectedDate,
        time: selectedTime,
        name: formData.name,
        phone: formData.phone,
        service_id: formData.serviceId,
      });

      if (response.success) {
        triggerHaptic('success');
        showToast('Запись успешно создана!', 'success');
        setShowBookingForm(false);
        setSelectedDate(null);
        setSelectedTime(null);
        loadData(); // Перезагружаем данные
      } else {
        triggerHaptic('error');
        showToast(`Ошибка: ${response.message}`, 'error');
      }
    } catch (error) {
      triggerHaptic('error');
      showToast('Ошибка при создании записи', 'error');
    }
  };
  
  const handleSettingsUpdate = (newSettings) => {
    setGuiSettings(newSettings);
  };
  
  // Применяем настройки GUI
  useEffect(() => {
    if (guiSettings) {
      // Не устанавливаем backgroundColor - используем градиент из Calendar
      // document.body.style.backgroundColor = guiSettings.background_color;
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
        <div className="spinner-warm"></div>
      </div>
    );
  }
  
  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: 'linear-gradient(135deg, #e8d0bc 0%, #d4b99e 40%, #c9a98c 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-warm-emerald" />
          <h1 className="text-xl font-bold text-warm-brown">
            {showAdmin ? 'Админ-панель' : 'Запись на наращивание'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Кнопка переключения темы */}
          <button
            onClick={toggleTheme}
            className="btn-icon-warm"
            title={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors btn-secondary-warm h-10"
            >
              {showAdmin ? '👤 Клиентский вид' : '⚙️ Админ-панель'}
            </button>
          )}
        </div>
      </div>
      
      {showAdmin ? (
        <AdminPanel
          guiSettings={guiSettings}
        />
      ) : (
        <>
          {/* Кнопка для входа в админ-режим (всегда видна) */}
          <div className="mb-4">
            <button
              onClick={() => {
                setIsAdmin(true);
                setShowAdmin(true);
                loadData(); // Перезагружаем данные с новым isAdmin
              }}
              className="w-full py-3 px-4 btn-secondary-warm text-sm"
            >
              ⚙️ Войти в админ-панель
            </button>
          </div>
          
          {availableDates.length === 0 ? (
            <>
              <div className="liquid-glass-heavy p-6 text-center mb-4">
                <p className="text-warm-text">Нет доступных дат для записи.</p>
                <p className="text-sm text-warm-text-secondary mt-2">Добавьте рабочие дни через админ-панель.</p>
              </div>

              {/* Кнопки-ссылки */}
              <div className="space-y-3">
                <a
                  href={import.meta.env.VITE_PRICES_POST_LINK || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-3 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-semibold text-warm-text">💰 Прайсы</span>
                  </div>
                  <p className="text-sm text-warm-text-secondary mt-1">Посмотреть цены на услуги</p>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={import.meta.env.VITE_TIKTOK_LINK || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl">🎵</span>
                      <span className="text-sm font-semibold text-warm-text">TikTok</span>
                    </div>
                  </a>

                  <a
                    href={import.meta.env.VITE_INSTAGRAM_LINK || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl">📸</span>
                      <span className="text-sm font-semibold text-warm-text">Instagram</span>
                    </div>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <Calendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                guiSettings={guiSettings}
                triggerHaptic={triggerHaptic}
                isAdmin={isAdmin}
              />

              {selectedDate && !showBookingForm && (
                <TimeSlots
                  slots={availableDates.find(d => d.date === selectedDate)?.slots || []}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  guiSettings={guiSettings}
                  triggerHaptic={triggerHaptic}
                />
              )}

              {showBookingForm && selectedDate && selectedTime && (
                <BookingForm
                  date={selectedDate}
                  time={selectedTime}
                  onSubmit={handleBookingSubmit}
                  guiSettings={guiSettings}
                  triggerHaptic={triggerHaptic}
                />
              )}

              {/* Кнопки-ссылки */}
              <div className="mt-6 space-y-3">
                <a
                  href={import.meta.env.VITE_PRICES_POST_LINK || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-3 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-semibold text-warm-text">💰 Прайсы</span>
                  </div>
                  <p className="text-sm text-warm-text-secondary mt-1">Посмотреть цены на услуги</p>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={import.meta.env.VITE_TIKTOK_LINK || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl">🎵</span>
                      <span className="text-sm font-semibold text-warm-text">TikTok</span>
                    </div>
                  </a>

                  <a
                    href={import.meta.env.VITE_INSTAGRAM_LINK || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xl">📸</span>
                      <span className="text-sm font-semibold text-warm-text">Instagram</span>
                    </div>
                  </a>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Toast уведомления */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
