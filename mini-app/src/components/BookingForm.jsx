// ============================================================
// src/components/BookingForm.jsx — Форма записи
// ============================================================

import React, { useState, useEffect } from 'react';
import { Check, Phone, User } from 'lucide-react';

export default function BookingForm({ date, time, onSubmit, guiSettings, triggerHaptic }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

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
    triggerHaptic?.('medium');

    try {
      await onSubmit({ name, phone, serviceId: selectedService });
      setName('');
      setPhone('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="liquid-glass-heavy p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-warm-text mb-4">Оформление записи</h3>

      <div className="mb-4 p-4 liquid-glass-subtle rounded-xl">
        <p className="text-sm text-warm-text-secondary">Дата: <span className="font-medium text-warm-text">{date}</span></p>
        <p className="text-sm text-warm-text-secondary">Время: <span className="font-medium text-warm-text">{time}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-warm-text mb-2">
            Ваше имя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-text-tertiary w-5 h-5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-warm pl-10"
              placeholder="Введите имя"
              onFocus={() => triggerHaptic?.('light')}
            />
          </div>
          {autoFilled && (
            <p className="text-xs text-sage mt-1">✓ Автозаполнено из Telegram</p>
          )}
        </div>

        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-warm-text mb-2">
              Выберите услугу
            </label>
            <div className="grid grid-cols-1 gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(service.id);
                    triggerHaptic?.('selection');
                  }}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-200 ease-out
                    backdrop-blur-2xl bg-white/75 relative
                    flex justify-between items-center
                    ${selectedService === service.id
                      ? 'bg-blush/15 border-2 border-blush shadow-[0_4px_16px_rgba(216,167,182,0.2)]'
                      : 'border border-warm-border/50 hover:bg-white/[0.85] hover:border-blush/30 hover:shadow-warm-md hover:-translate-y-0.5'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-warm-text">{service.name}</span>
                    <span className="text-sm font-semibold text-blush">{service.price} ₽</span>
                  </div>
                  {selectedService === service.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-blush" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-warm-text mb-2">
            Телефон
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-text-tertiary w-5 h-5" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input-warm pl-10"
              placeholder="+7 (999) 999-99-99"
              onFocus={() => triggerHaptic?.('light')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name || !phone}
          className="btn-primary-warm w-full h-14 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="spinner-warm" />
              <span>Отправка...</span>
            </>
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
