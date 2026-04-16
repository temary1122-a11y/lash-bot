// ============================================================
// src/components/AdminPanel.jsx — Админ-панель
// ============================================================

import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { FileText, Calendar } from 'lucide-react';
import AdminSchedulePanel from './AdminSchedulePanel';

export default function AdminPanel({ guiSettings }) {
  const [activeTab, setActiveTab] = useState('dates');

  return (
    <div className="liquid-glass-heavy p-6">
      {/* Tabs */}
      <div className="mb-6 w-full">
        <div className="grid grid-cols-2 gap-1 p-1.5 bg-warm-border/30 rounded-3xl w-full">
          <button
            onClick={() => setActiveTab('dates')}
            className={`h-11 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'dates'
                ? 'bg-white shadow-sm text-warm-text scale-[1.02]'
                : 'text-warm-text-secondary hover:text-warm-text'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Даты</span>
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`h-11 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'content'
                ? 'bg-white shadow-sm text-warm-text scale-[1.02]'
                : 'text-warm-text-secondary hover:text-warm-text'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="hidden sm:inline">Контент</span>
          </button>
        </div>
      </div>

      {activeTab === 'dates' ? (
        <AdminSchedulePanel apiClient={apiClient} adminId={8736987138} guiSettings={guiSettings} />
      ) : (
        <ContentPanel />
      )}
    </div>
  );
}

// Компонент для редактирования контента
function ContentPanel() {
  // Заглушки для ссылок (позже будут в env)
  const tiktokLink = import.meta.env.VITE_TIKTOK_LINK || '#';
  const instagramLink = import.meta.env.VITE_INSTAGRAM_LINK || '#';
  const pricesPostLink = import.meta.env.VITE_PRICES_POST_LINK || '#';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blush" />
        <h2 className="text-xl font-semibold text-warm-text">Ссылки на соцсети</h2>
      </div>

      <div className="space-y-4">
        {/* Прайсы */}
        <a
          href={pricesPostLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full p-4 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-semibold text-warm-text">💰 Прайсы</span>
          </div>
          <p className="text-sm text-warm-text-secondary mt-1">Посмотреть цены на услуги</p>
        </a>

        {/* TikTok */}
        <a
          href={tiktokLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full p-4 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="text-lg font-semibold text-warm-text">TikTok</span>
          </div>
        </a>

        {/* Instagram */}
        <a
          href={instagramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full p-4 liquid-glass rounded-xl hover:bg-white/50 transition-all duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">📸</span>
            <span className="text-lg font-semibold text-warm-text">Instagram</span>
          </div>
        </a>
      </div>
    </div>
  );
}
