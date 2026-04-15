// ============================================================
// src/components/AdminPanel.jsx — Админ-панель для настройки GUI
// ============================================================

import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Palette, Image as ImageIcon, CalendarPlus, Calendar, Clock, FileText } from 'lucide-react';
import AdminSchedulePanel from './AdminSchedulePanel';

export default function AdminPanel({ guiSettings, onSettingsUpdate }) {
  const [settings, setSettings] = useState(guiSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('gui'); // 'gui', 'dates', 'content'
  
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
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'content'
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ backgroundColor: activeTab === 'content' ? settings.primary_color : '' }}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Контент
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
      ) : activeTab === 'dates' ? (
        <AdminSchedulePanel apiClient={apiClient} adminId={window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0} />
      ) : (
        <ContentPanel />
      )}
    </div>
  );
}

// Компонент для редактирования контента
function ContentPanel() {
  const [prices, setPrices] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadContent();
  }, []);
  
  const loadContent = async () => {
    try {
      setLoading(true);
      // Загрузка прайсов и портфолио из config
      // Временно используем дефолтные значения
      setPrices('💰 Прайсы\n\nКлассика — 2000₽\nОбъем — 2500₽\nПушистый — 3000₽');
      setPortfolioLink('https://example.com/portfolio');
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      // Здесь будет сохранение на сервер
      alert('Контент сохранён (функционал в разработке)');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-semibold text-gray-800">Редактирование контента</h2>
      </div>
      
      <div className="space-y-6">
        {/* Прайсы */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Прайсы
          </label>
          <textarea
            value={prices}
            onChange={(e) => setPrices(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Введите прайсы..."
          />
        </div>
        
        {/* Портфолио */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ссылка на портфолио
          </label>
          <input
            type="url"
            value={portfolioLink}
            onChange={(e) => setPortfolioLink(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com/portfolio"
          />
        </div>
        
        {/* Кнопка сохранения */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-white transition-all hover:shadow-lg disabled:opacity-50"
          style={{ backgroundColor: '#6366f1' }}
        >
          {loading ? 'Сохранение...' : 'Сохранить контент'}
        </button>
      </div>
    </div>
  );
}
