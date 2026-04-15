// ============================================================
// src/components/AdminPanel.jsx — Админ-панель для настройки GUI
// ============================================================

import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Palette, Image as ImageIcon, CalendarPlus, Calendar, Clock } from 'lucide-react';

export default function AdminPanel({ guiSettings, onSettingsUpdate }) {
  const [settings, setSettings] = useState(guiSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('gui'); // 'gui' or 'dates'
  
  const handleColorChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleStyleChange = (style) => {
    setSettings(prev => ({ ...prev, calendar_style: style }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await apiClient.updateGUISettings(settings);
      onSettingsUpdate(updated);
    } finally {
      setIsSaving(false);
    }
  };
  
  const colorPresets = [
    { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6' },
    { name: 'Rose', primary: '#f43f5e', secondary: '#fb7185' },
    { name: 'Emerald', primary: '#10b981', secondary: '#34d399' },
    { name: 'Amber', primary: '#f59e0b', secondary: '#fbbf24' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('gui')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'gui'
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ backgroundColor: activeTab === 'gui' ? settings.primary_color : '' }}
        >
          <div className="flex items-center justify-center gap-2">
            <Palette className="w-5 h-5" />
            Дизайн
          </div>
        </button>
        <button
          onClick={() => setActiveTab('dates')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'dates'
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ backgroundColor: activeTab === 'dates' ? settings.primary_color : '' }}
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Даты
          </div>
        </button>
      </div>

      {activeTab === 'gui' ? (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-800">Настройка интерфейса</h2>
          </div>

          {/* Color presets */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Цветовая схема</h3>
            <div className="grid grid-cols-4 gap-3">
              {colorPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    handleColorChange('primary_color', preset.primary);
                    handleColorChange('secondary_color', preset.secondary);
                  }}
                  className="p-3 rounded-xl border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: settings.primary_color === preset.primary ? preset.primary : '#e5e7eb',
                  }}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Основной цвет
              </label>
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => handleColorChange('primary_color', e.target.value)}
                className="w-full h-12 rounded-xl cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вторичный цвет
              </label>
              <input
                type="color"
                value={settings.secondary_color}
                onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                className="w-full h-12 rounded-xl cursor-pointer"
              />
            </div>
          </div>

          {/* Background */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Фон</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Цвет фона</label>
                <input
                  type="color"
                  value={settings.background_color}
                  onChange={(e) => handleColorChange('background_color', e.target.value)}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Фоновое изображение (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.background_image || ''}
                    onChange={(e) => handleColorChange('background_image', e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Calendar style */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Стиль календаря</h3>
            <div className="grid grid-cols-3 gap-3">
              {['modern', 'classic', 'minimal'].map(style => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style)}
                  className={`p-3 rounded-xl border-2 transition-all capitalize ${
                    settings.calendar_style === style ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 rounded-xl font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
            style={{ backgroundColor: settings.primary_color }}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </>
      ) : (
        <DateManagementPanel />
      )}
    </div>
  );
}

// Компонент управления датами
function DateManagementPanel() {
  const [newDate, setNewDate] = useState('');
  const [timeSlots, setTimeSlots] = useState('default');
  const [customSlots, setCustomSlots] = useState('');
  const [message, setMessage] = useState('');
  const [workDays, setWorkDays] = useState([]);
  const [loading, setLoading] = useState(false);

  // Получаем admin_id из Telegram WebApp
  const adminId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0;

  const loadWorkDays = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getWorkDays(adminId);
      setWorkDays(data);
    } catch (error) {
      console.error('Error loading work days:', error);
      setMessage('Ошибка загрузки рабочих дней');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkDays();
  }, []);

  const handleAddDate = async () => {
    if (!newDate) {
      setMessage('Введите дату');
      return;
    }

    try {
      setLoading(true);
      const slots = timeSlots === 'custom' ? customSlots.split(',').map(s => s.trim()) : 'default';
      const result = await apiClient.addWorkDay(newDate, slots, adminId);

      if (result.success) {
        setMessage('Рабочий день добавлен');
        setNewDate('');
        setTimeSlots('default');
        setCustomSlots('');
        loadWorkDays();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error adding date:', error);
      setMessage('Ошибка при добавлении даты');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (date, time) => {
    try {
      setLoading(true);
      const result = await apiClient.deleteTimeSlot(date, time, adminId);
      if (result.success) {
        setMessage('Слот удалён');
        loadWorkDays();
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      setMessage('Ошибка при удалении слота');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = async (date, isClosed) => {
    try {
      setLoading(true);
      if (isClosed) {
        await apiClient.openDay(date, adminId);
      } else {
        await apiClient.closeDay(date, adminId);
      }
      loadWorkDays();
    } catch (error) {
      console.error('Error toggling day:', error);
      setMessage('Ошибка при изменении статуса дня');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CalendarPlus className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-semibold text-gray-800">Управление датами</h2>
      </div>

      {/* Add new date */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Добавить рабочий день</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Дата (ГГГГ-ММ-ДД)</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Временные слоты</label>
            <select
              value={timeSlots}
              onChange={(e) => setTimeSlots(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300"
            >
              <option value="default">Стандартные (09:00, 10:30, 12:00, ...)</option>
              <option value="custom">Свои слоты</option>
            </select>
          </div>
          {timeSlots === 'custom' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Слоты через запятую (например: 09:00, 10:30, 12:00)</label>
              <input
                type="text"
                value={customSlots}
                onChange={(e) => setCustomSlots(e.target.value)}
                placeholder="09:00, 10:30, 12:00"
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>
          )}
          <button
            onClick={handleAddDate}
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
            style={{ backgroundColor: '#6366f1' }}
          >
            <div className="flex items-center justify-center gap-2">
              <CalendarPlus className="w-5 h-5" />
              {loading ? 'Добавление...' : 'Добавить день'}
            </div>
          </button>
        </div>
      </div>

      {/* Work days list */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Рабочие дни</h3>
        {workDays.length === 0 ? (
          <p className="text-gray-500 text-sm">Нет рабочих дней</p>
        ) : (
          <div className="space-y-3">
            {workDays.map(day => (
              <div key={day.date} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{day.date}</span>
                  <button
                    onClick={() => handleToggleDay(day.date, day.is_closed)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      day.is_closed
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {day.is_closed ? 'Закрыт' : 'Открыт'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.slots.map(slot => (
                    <div
                      key={slot}
                      className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs"
                    >
                      <Clock className="w-3 h-3" />
                      {slot}
                      <button
                        onClick={() => handleDeleteSlot(day.date, slot)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div className={`rounded-xl p-4 text-sm ${
          message.includes('Ошибка') || message.includes('занят')
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {adminId === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          <p className="font-medium mb-2">⚠️ Внимание:</p>
          <p>Admin ID не определён. Откройте Mini App через Telegram бота.</p>
        </div>
      )}
    </div>
  );
}
