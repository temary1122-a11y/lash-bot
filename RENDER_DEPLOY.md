# Деплой Backend на Render

## Через веб-интерфейс (проще для первого раза)

1. **Зарегистрируйтесь на Render:** https://render.com

2. **Создайте новый Web Service:**
   - Нажмите "New +" → "Web Service"
   - Подключите ваш GitHub репозиторий (если код на GitHub)
   - Или выберите "Build and deploy from a Git repository"

3. **Настройки:**
   - **Name:** lash-bot-backend
   - **Region:** Frankfurt (или ближайший)
   - **Branch:** main
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn api.app:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables (скопируйте из .env):**
   - BOT_TOKEN=ваш_токен
   - ADMIN_ID=ваш_id
   - CHANNEL_ID=ваш_канал
   - SCHEDULE_CHANNEL_ID=ваш_канал_расписания
   - CHANNEL_LINK=ваша_ссылка

5. **Нажмите "Create Web Service"**

6. **Подождите деплой (5-10 минут)**

7. **Скопируйте URL** вида: `https://lash-bot-backend.onrender.com`

## Обновление frontend

После деплоя backend:

1. В `mini-app/.env`:
   ```
   VITE_BACKEND_URL=https://lash-bot-backend.onrender.com
   ```

2. Пересоберите и задеплойте frontend:
   ```bash
   cd mini-app
   npm run build
   vercel --prod --yes
   ```

## Обновление бота

В `keyboards/inline.py`:
```python
InlineKeyboardButton(
    text="✨ Mini App",
    web_app=WebAppInfo(url="https://mini-app-gamma-ashen.vercel.app")
)
```

## Примечание

- Бесплатный план Render засыпает через 15 минут неактивности
- Первый запуск может занять до 10 минут
- Для постоянной работы нужен платный план ($7/мес)
