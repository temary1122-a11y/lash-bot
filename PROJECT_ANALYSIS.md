# Анализ проекта Lash Bot

## Обзор проекта

**Проект:** Lash Bot - система бронирования для салона ресниц
**Технологии:**
- Telegram бот (aiogram)
- FastAPI бэкенд
- React Mini App (Vite + TailwindCSS)
- SQLite база данных
- Деплой: Railway (бэкенд), Vercel (фронтенд)

## Архитектура

### 1. Telegram Bot (`bot.py`)
- **Фреймворк:** aiogram 3.x
- **Функции:**
  - Обработка команд через меню
  - Управление расписанием через бота
  - Интеграция с Mini App через WebApp
- **Запуск:** `py -3.12 bot.py`
- **Статус:** Работает, но не нужен для Mini App

### 2. Backend API (`api/`)
- **Фреймворк:** FastAPI
- **Файлы:**
  - `api/app.py` - основное приложение
  - `api/routes/admin.py` - админ endpoints
  - `api/routes/booking.py` - бронирование
  - `api/models.py` - Pydantic модели
  - `database/db.py` - SQLite операции
- **Запуск:** `py -3.12 -m uvicorn api.app:app --reload --port 8000`
- **Деплой:** Railway (https://lashes-production-3342.up.railway.app)
- **Статус:** Локально работает, на Railway есть проблемы с аутентификацией

### 3. Frontend Mini App (`mini-app/`)
- **Фреймворк:** React + Vite
- **Стилизация:** TailwindCSS
- **Компоненты:**
  - `App.jsx` - главный компонент
  - `AdminSchedulePanel.jsx` - админ-панель расписания
  - `TimeSlots.jsx` - слоты для клиентов
  - `api/client.js` - API клиент
- **Запуск:** `npm run dev` (http://localhost:3001)
- **Деплой:** Vercel (https://mini-app-gamma-ashen.vercel.app)
- **Статус:** Локально работает, на проде есть ошибки

## Текущая проблема

### Описание
Ошибка при добавлении временных слотов в админ-панели Mini App:
- **Ошибка:** "ошибка при выставлении слота"
- **HTTP статус:** 422 Unprocessable Entity
- **Endpoints с проблемой:**
  - POST `/api/admin/add-work-day`
  - POST `/api/admin/add-time-slot`
  - POST `/api/admin/close-day`
  - POST `/api/admin/open-day`

### Симптомы
1. **Локально (localhost):**
   - Бэкенд на порту 8000 работает
   - Mini App на порту 3001 работает
   - GET запросы работают (200 OK)
   - POST запросы возвращают 422
   - DEBUG логи не появляются (Pydantic валидация не проходит)

2. **Продакшен (Railway + Vercel):**
   - GET `/api/admin/work-days` возвращает 403 Forbidden
   - POST запросы возвращают 422
   - Проблема с аутентификацией админа

### Что уже попробовано

#### 1. Фикс параметров API клиента
- **Проблема:** Неправильная передача параметров в API методы
- **Решение:** Исправлена передача `adminId` во все методы
- **Результат:** Не помогло

#### 2. Фикс adminId в AdminPanel
- **Проблема:** `adminId` был 0 при открытии вне Telegram
- **Решение:** Хардкод `ADMIN_ID = 8736987138` в AdminPanel
- **Результат:** Не помогло

#### 3. Отключение проверки админа на бэкенде
- **Проблема:** Railway блокирует запросы с 403
- **Решение:** Изменил `Header(...)` на `Header(None)` и отключил verify_admin
- **Результат:** Railway ещё не задеплоил изменения

#### 4. Исправление Content-Type заголовков
- **Проблема:** Content-Type мог перезаписываться
- **Решение:** Изменил порядок заголовков в API клиенте
- **Результат:** Не помогло

#### 5. Изменение Pydantic моделей на dict
- **Проблема:** Pydantic валидация не проходит (422 до функции)
- **Решение:** Заменил Pydantic модели на `dict` для отладки
- **Результат:** В процессе тестирования

## Технические детали

### API клиент (mini-app/src/api/client.js)
```javascript
async addWorkDay(date, timeSlots, adminId) {
  return this.request('/api/admin/add-work-day', {
    method: 'POST',
    headers: {
      'x-admin-id': adminId,
    },
    body: JSON.stringify({ date, time_slots: timeSlots }),
  });
}
```

### Backend endpoint (api/routes/admin.py)
```python
@router.post("/add-work-day")
async def add_work_day_endpoint(request: dict, x_admin_id: int = Header(None)):
    """Добавить рабочий день"""
    await verify_admin(x_admin_id)
    print(f"DEBUG add-work-day: request={request}")
    
    date = request.get("date")
    time_slots = request.get("time_slots")
    
    if not date:
        raise HTTPException(status_code=422, detail="date is required")
    
    success = add_work_day(date, time_slots)
    return {"success": success}
```

### Pydantic модели (api/models.py)
```python
class AddWorkDayRequest(BaseModel):
    date: str
    time_slots: list[str] | None = None

class AddTimeSlotRequest(BaseModel):
    date: str
    time: str
```

## Конфигурация

### .env файл
```
BOT_TOKEN=<token>
ADMIN_ID=8736987138
SCHEDULE_CHANNEL_ID=@channel
CHANNEL_ID=@channel
CHANNEL_LINK=https://t.me/channel
DB_PATH=lash_bot.db
```

### Railway переменные окружения
- **Проблема:** ADMIN_ID может не быть установлен
- **Статус:** Нужно проверить

## Следующие шаги для анализа

1. **Проверить Railway переменные окружения**
   - Установить ADMIN_ID=8736987138
   - Проверить другие переменные

2. **Добавить детальное логирование**
   - Логировать входящие JSON тела
   - Логировать Pydantic ошибки валидации
   - Логировать заголовки запросов

3. **Протестировать с чистым Pydantic**
   - Вернуть Pydantic модели
   - Добавить `@app.exception_handler` для 422 ошибок
   - Логировать детали валидации

4. **Проверить структуру JSON**
   - Убедиться что `time_slots` отправляется правильно
   - Проверить типы данных (string vs int)
   - Проверить формат даты

5. **Альтернативный подход**
   - Использовать Form data вместо JSON
   - Или Query параметры для простых случаев

## Логи

### Локальный бэкенд (последние запросы)
```
INFO: 127.0.0.1:51543 - "POST /api/admin/add-work-day HTTP/1.1" 422
INFO: 127.0.0.1:51543 - "POST /api/admin/add-time-slot HTTP/1.1" 422
INFO: 127.0.0.1:51543 - "POST /api/admin/close-day HTTP/1.1" 422
```

### Консоль браузера
```
Error adding slot: {}
API request error: {}
```

## Вывод

Проблема заключается в валидации Pydantic на бэкенде. Запросы не проходят валидацию и возвращают 422 до того как достигают обработчика. Нужно:
1. Добавить детальное логирование валидации
2. Проверить что именно отправляет фронтенд
3. Убедиться что структура JSON соответствует Pydantic моделям
4. Настроить переменные окружения на Railway
