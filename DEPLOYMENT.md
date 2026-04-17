# Деплой Lash Bot с Mini App (Liquid Glass Design)

## Бесплатные хостинги

### Frontend (React 19 + Vite 7 + TailwindCSS 4)

**Вариант 1: Vercel (рекомендуется)**
1. Создайте аккаунт на https://vercel.com
2. Установите Vercel CLI: `npm i -g vercel`
3. В папке `mini-app` выполните:
   ```bash
   vercel
   ```
4. Следуйте инструкциям
5. Получите URL вида: `https://your-app.vercel.app`

**Вариант 2: Netlify**
1. Создайте аккаунт на https://netlify.com
2. В папке `mini-app` выполните:
   ```bash
   npm run build
   ```
3. Загрузите папку `dist` на Netlify через drag & drop

### Backend (FastAPI + Python 3.13)

**Вариант 1: Render (рекомендуется)**
1. Создайте аккаунт на https://render.com
2. Создайте "New Web Service"
3. Подключите GitHub репозиторий
4. Настройте:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api.app:app --host 0.0.0.0 --port $PORT`
   - Environment Variables: скопируйте из `.env`
5. Получите URL вида: `https://your-backend.onrender.com`

**Вариант 2: Railway**
1. Создайте аккаунт на https://railway.app
2. Создайте новый проект
3. Добавьте GitHub репозиторий
4. Настройте переменные окружения

## Настройка Mini App для продакшена

1. В `mini-app/.env`:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   VITE_PRICES_POST_LINK=https://t.me/your_channel/post_id
   VITE_TIKTOK_LINK=https://tiktok.com/@yourusername
   VITE_INSTAGRAM_LINK=https://instagram.com/yourusername
   ```

2. В `mini-app` выполните:
   ```bash
   npm install
   npm run build
   ```

3. Разверните папку `dist` на Vercel/Netlify

## Новые функции v2.0

### Отмена записи с причиной
- Клиент может отменить запись через бота с указанием причины
- Причина сохраняется в базе данных
- Админ видит статус отмены и причину в Mini App

### История записей
- Админ может просматривать полную историю записей
- Данные доступны для анализа трафика
- Фильтрация по статусу (активные/отмененные)

### Напоминания
- Автоматические напоминания за 24 часа до записи
- Отправляются через Telegram Bot
- Настраиваются через APScheduler

## Настройка Telegram Bot

1. В `keyboards/inline.py` замените URL на продакшен:
   ```python
   InlineKeyboardButton(
       text="✨ Mini App",
       web_app=WebAppInfo(url="https://your-app.vercel.app")
   )
   ```

2. Разверните бота на том же хостинге что и backend (Render/Railway)

3. Убедитесь что переменные окружения настроены

## CORS Настройка

В `api/app.py` уже настроен CORS для всех источников. Для продакшена ограничьте:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],  # Только ваш фронтенд
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Проверка перед деплоем

- [ ] Все переменные окружения настроены
- [ ] Frontend собирается без ошибок (`npm run build`)
- [ ] Backend запускается локально
- [ ] API endpoints работают
- [ ] Mini App работает в Telegram
- [ ] База данных инициализируется корректно

## Структура продакшена

```
Frontend: https://your-app.vercel.app (Vercel - бесплатно)
Backend:  https://your-backend.onrender.com (Render - бесплатно)
Bot:      Запускается на том же сервере что и backend
```

## Мониторинг

- Render: автоматические логи и мониторинг
- Vercel: логи и аналитика
- Telegram Bot: используйте @BotFather для статистики

## Резервное копирование

- База данных SQLite: регулярно копируйте `lash_bot.db`
- Настройте автоматический бэкап на Render
