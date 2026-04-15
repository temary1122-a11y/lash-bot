# 🚀 Lash Bot Mini App — Быстрый старт

## Что создано

✅ **Backend (FastAPI)**
- API endpoints для записи
- Админ-панель для настройки GUI
- Интеграция с существующей БД

✅ **Frontend (React + Vite)**
- Красивый календарь с выбором дат
- Слоты времени в карточках
- Форма записи
- Админ-панель для настройки дизайна

✅ **Интеграция**
- Кнопка Mini App в боте
- Telegram Web Apps SDK
- Автоматический run-скрипт

## Быстрый запуск

### 1. Установите зависимости (автоматически)

```powershell
.\start.ps1
```

Скрипт автоматически:
- Проверит Python 3.12 и Node.js
- Установит Python зависимости
- Установит frontend зависимости
- Запустит оба сервера

### 2. Откройте бота в Telegram

Отправьте `/start` и нажмите кнопку **✨ Mini App**

### 3. Настройте GUI

В Mini App нажмите на иконку ⚙️ для настройки:
- Цветовой схемы
- Фона
- Стиля календаря

## Ручной запуск (если нужно)

### Только backend
```powershell
.\start.ps1 -BackendOnly
```

### Production режим
```powershell
.\start.ps1 -Production
```

## Доступные URL

После запуска:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Структура проекта

```
lash_bot/
├── api/                    # FastAPI backend
│   ├── app.py             # Главный файл
│   ├── models.py          # Pydantic модели
│   └── routes/           # API endpoints
├── mini-app/              # React frontend
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── api/          # API клиент
│   │   └── App.jsx       # Главный компонент
│   └── package.json
├── bot.py                 # Telegram бот
└── start.ps1              # Run-скрипт
```

## Требования

- Python 3.12+
- Node.js 18+
- PowerShell (для start.ps1)

## Следующие шаги

1. Запустите `.\start.ps1`
2. Откройте бота и нажмите Mini App
3. Настройте дизайн через админку
4. Добавьте рабочие дни через `/admin` в боте
5. Протестируйте запись!

## Troubleshooting

**Скрипт не запускается:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Node.js не найден:**
Установите с https://nodejs.org/

**Python 3.12 не найден:**
Установите с https://www.python.org/downloads/release/python-3128/

**Frontend не собирается:**
```powershell
cd mini-app
rm -rf node_modules package-lock.json
npm install
```
