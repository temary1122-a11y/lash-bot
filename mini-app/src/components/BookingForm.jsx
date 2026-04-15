// ============================================================
// src/components/BookingForm.jsx — Форма записи
// ============================================================

import React, { useState, useEffect } from 'react';
import { Check, Phone, User } from 'lucide-react';

export default function BookingForm({ date, time, onSubmit, guiSettings }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const primaryColor = guiSettings?.primary_color || '#6366f1';
  const services = guiSettings?.services || [];

  // Автовыбор первой услуги если есть
  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

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

      // requestContact не поддерживается в текущей версии Telegram WebApp
      // Оставляем только автозаполнение имени
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ name, phone, serviceId: selectedService });
      setName('');
      setPhone('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Оформление записи</h3>

      <div className="mb-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-600">Дата: <span className="font-medium text-neutral-900">{date}</span></p>
        <p className="text-sm text-neutral-600">Время: <span className="font-medium text-neutral-900">{time}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Ваше имя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input pl-10"
              placeholder="Введите имя"
            />
          </div>
          {autoFilled && (
            <p className="text-xs text-success-dark mt-1">✓ Автозаполнено из Telegram</p>
          )}
        </div>

        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Выберите услугу
            </label>
            <div className="grid grid-cols-1 gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`
                    p-3 rounded-xl text-left transition-all
                    ${selectedService === service.id
                      ? 'bg-primary-50 border-2 border-primary-500 text-primary-900'
                      : 'bg-white border border-neutral-200 hover:border-primary-300 text-neutral-700'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-sm font-semibold">{service.price} ₽</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Телефон
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input pl-10"
              placeholder="+7 (999) 999-99-99"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name || !phone}
          className="btn-primary w-full btn-lg flex items-center justify-center gap-2"
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
