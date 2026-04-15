# Lash Bot Mini App

Telegram Mini App для записи на наращивание ресниц с красивым GUI.

## Возможности

### Клиентская часть
- 📅 Интерактивный календарь с выбором дат
- ⏰ Слоты времени в виде карточек
- 🎨 Настраиваемый дизайн через админку
- 📱 Адаптивный интерфейс для мобильных
- ✨ Современные анимации

### Админ-панель
- 🎨 Редактор цветовой схемы
- 🖼 Загрузка фоновых изображений
- 📅 Настройка стиля календаря
- 💾 Превью настроек в реальном времени

## Установка и запуск

### Требования
- Python 3.12+
- Node.js 18+
- npm или yarn

### Быстрый старт

```powershell
# Запуск в dev режиме (frontend + backend)
.\start.ps1

# Запуск только backend
.\start.ps1 -BackendOnly

# Production режим (build + backend)
.\start.ps1 -Production
```

### Ручной запуск

#### Backend
```powershell
# Установка зависимостей
py -3.12 -m pip install -r requirements.txt

# Запуск API сервера
py -3.12 -m uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```powershell
cd mini-app

# Установка зависимостей
npm install

# Dev режим
npm run dev

# Сборка для продакшена
npm run build
```

## API Endpoints

### Booking
- `GET /api/booking/available-dates` — Получить доступные даты
- `POST /api/booking/book` — Создать запись
- `GET /api/booking/my-bookings/{user_id}` — Получить записи пользователя
- `DELETE /api/booking/cancel/{booking_id}` — Отменить запись

### Admin
- `GET /api/admin/settings` — Получить настройки GUI
- `POST /api/admin/settings` — Обновить настройки GUI

## Структура проекта

```
lash_bot/
├── api/                      # FastAPI backend
│   ├── app.py               # Главный файл приложения
│   ├── models.py            # Pydantic модели
│   └── routes/
│       ├── booking.py       # Routes для записи
│       └── admin.py         # Routes для админки
├── mini-app/                # React frontend
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   │   ├── Calendar.jsx
│   │   │   ├── TimeSlots.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── api/
│   │   │   └── client.js    # API клиент
│   │   ├── App.jsx          # Главный компонент
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── bot.py                   # Telegram бот
├── database/                # База данных
└── start.ps1                # Скрипт запуска
```

## Интеграция с Telegram

1. Добавьте в бота кнопку для открытия Mini App:
```python
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [InlineKeyboardButton(
            text="📅 Записаться",
            web_app=WebAppInfo(url="https://your-domain.com")
        )]
    ]
)
```

2. Mini App автоматически интегрируется с Telegram через Telegram Web Apps SDK

## Настройка

### GUI настройки
Настройки хранятся в памяти (в продакшене — в БД). Можно изменить через админ-панель в Mini App.

### Цвета
- Primary color — основной цвет кнопок и акцентов
- Secondary color — вторичный цвет
- Background color — цвет фона
- Background image — URL фонового изображения

### Стили календаря
- Modern — современный минималистичный
- Classic — классический вид
- Minimal — минималистичный

## Разработка

### Добавление новых endpoints

1. Создайте модель в `api/models.py`
2. Добавьте route в `api/routes/`
3. Подключите в `api/app.py`

### Добавление новых компонентов

1. Создайте компонент в `mini-app/src/components/`
2. Импортируйте в `App.jsx`
3. Используйте в приложении

## Troubleshooting

**Frontend не запускается:**
```powershell
cd mini-app
rm -rf node_modules package-lock.json
npm install
```

**Backend не запускается:**
```powershell
py -3.12 -m pip install --upgrade -r requirements.txt
```

**Tailwind не работает:**
Убедитесь, что `tailwind.config.js` и `postcss.config.js` настроены правильно.

## Технологический стек

**Backend:**
- FastAPI
- Uvicorn
- aiogram
- SQLite

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Telegram Web Apps SDK
- date-fns
- Lucide Icons
