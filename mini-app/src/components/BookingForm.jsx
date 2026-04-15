// ============================================================
// src/components/BookingForm.jsx — Форма записи
// ============================================================

import React, { useState, useEffect } from 'react';
import { Check, Phone, User } from 'lucide-react';

export default function BookingForm({ date, time, onSubmit, guiSettings }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  
  const primaryColor = guiSettings?.primary_color || '#6366f1';
  
  // Автозаполнение данных из Telegram WebApp
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Получаем имя пользователя
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        if (fullName) {
          setName(fullName);
          setAutoFilled(true);
        }
      }
      
      // Запрашиваем номер телефона через Telegram WebApp API
      const requestPhone = () => {
        if (tg.requestContact) {
          tg.requestContact((message) => {
            if (message && message.contact) {
              setPhone(message.contact.phone_number);
              setAutoFilled(true);
            }
          });
        }
      };
      
      // Кнопка для запроса контакта
      window.requestTelegramPhone = requestPhone;
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({ name, phone });
      setName('');
      setPhone('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Оформление записи</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600">Дата: <span className="font-medium">{date}</span></p>
        <p className="text-sm text-gray-600">Время: <span className="font-medium">{time}</span></p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ваше имя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Введите имя"
            />
          </div>
          {autoFilled && (
            <p className="text-xs text-green-600 mt-1">✓ Автозаполнено из Telegram</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="+7 (999) 999-99-99"
            />
          </div>
          {window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.requestContact && (
            <button
              type="button"
              onClick={() => window.requestTelegramPhone && window.requestTelegramPhone()}
              className="text-xs text-indigo-600 mt-1 hover:underline"
            >
              📱 Запросить номер из Telegram
            </button>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !name || !phone}
          className="w-full py-3 rounded-xl font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? (
            'Отправка...'
          ) : (
            <>
              <Check className="w-5 h-5" />
              Подтвердить запись
            </>
          )}
        </button>
      </form>
    </div>
  );
}
