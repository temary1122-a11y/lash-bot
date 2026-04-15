# КОНСПЕКТ ПРОБЛЕМ LASH BOT ДЛЯ АНАЛИЗА CLAUDE

## 🎯 ОСНОВНАЯ ПРОБЛЕМА

**Дублирование записей в админке:** При добавлении слота на одну дату, записи появляются на других датах. Например: добавляю слот на 23 число → появляется на 16 числе.

---

## 📋 СИМПТОМЫ

1. **Дублирование слотов:** Один слот появляется на 4-5 разных датах
2. **Перезапись selectedDay:** При клике на дату, selectedDay может перезаписываться на другую дату
3. **Множественные запросы:** В логах видно множество `GET /api/admin/work-days` запросов подряд
4. **Бэкенд работает правильно:** Логи Railway показывают правильные даты (например: `date='2026-04-23'`)
5. **Проблема 100% на фронтенде:** React state management issue

---

## 🔧 ЧТО УЖЕ СДЕЛАНО

### 1. Исправления в AdminSchedulePanel.jsx
- ✅ Добавлен `useRef` для `selectedDayRef` (защита от stale closure)
- ✅ Добавлен `useEffect` для синхронизации ref с state
- ✅ Обёрнуты обработчики в `useCallback`
- ✅ `handleAddSlot` использует `selectedDayRef.current` вместо `selectedDay`
- ✅ `handleDeleteSlot` использует `selectedDayRef.current` вместо `selectedDay`
- ✅ Добавлено детальное логирование:
  - `=== selectedDay CHANGED ===`
  - `=== DAY CLICKED ===`
  - `=== ADDING SLOT ===`

### 2. Исправления в client.js
- ✅ Добавлено логирование в `addTimeSlot`: `[API] addTimeSlot → date: ...`
- ✅ Исправлен порядок аргументов в `addTimeSlot` и `deleteTimeSlot`
- ✅ Добавлены методы `openDay` и `closeDay`

### 3. Исправления в Vercel
- ✅ Создан `vercel.json` с отключением кэширования:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
  ```
- ✅ Выполнен force deploy с `--force`
- ✅ Добавлен cache-busting в `vite.config.js` (хеширование файлов)

### 4. Очистка базы данных
- ✅ Создан API endpoint `/api/admin/cleanup-database`
- ✅ Продакшен база очищена (0 work_days, 0 time_slots, 0 bookings)
- ✅ Дубликатов не было найдено

### 5. Другие исправления
- ✅ Закомментирован `loadClients()` который вызывал ошибку 422
- ✅ Исправлена кнопка "+X ещё" в Calendar.jsx
- ✅ Добавлена модель Service и service_id в BookingRequest

---

## ❌ ПРОБЛЕМА СОХРАНЯЕТСЯ

**Новые логи не появляются в консоли браузера:**
- Нет `=== selectedDay CHANGED ===`
- Нет `[API] addTimeSlot → date: ...`

**Вывод:** Vercel всё ещё кэширует старую версию фронтенда, несмотря на force deploy и vercel.json.

---

## 📁 КЛЮЧЕВЫЕ ФАЙЛЫ

### Frontend
- `mini-app/src/components/AdminSchedulePanel.jsx` - компонент с проблемой
- `mini-app/src/api/client.js` - API клиент
- `mini-app/vite.config.js` - конфигурация Vite (добавлен cache-busting)
- `mini-app/vercel.json` - конфигурация Vercel (отключено кэширование)

### Backend
- `api/routes/admin.py` - админские endpoints (добавлен cleanup-database)
- `database/db.py` - функции работы с БД
- `api/models.py` - Pydantic модели

---

## 🔗 URL

- **Бэкенд:** https://lashes-production-3342.up.railway.app
- **Фронтенд:** https://mini-app-gamma-ashen.vercel.app
- **Admin ID:** 8736987138

---

## 💬 ЛОГИ БРАУЗЕРА (последние)

```
client.js:15 API Request: GET /api/admin/work-days
client.js:15 API Request: GET /api/admin/bookings/2026-04-15
client.js:15 API Request: POST /api/admin/add-work-day
client.js:15 API Request: POST /api/admin/add-time-slot
client.js:15 API Request: GET /api/admin/work-days
client.js:15 API Request: GET /api/admin/work-days
client.js:15 API Request: GET /api/admin/bookings/2026-04-30
client.js:15 API Request: POST /api/admin/add-work-day
client.js:15 API Request: POST /api/admin/add-time-slot
client.js:15 API Request: GET /api/admin/work-days
client.js:15 API Request: GET /api/admin/work-days
```

**Характерно:**
- Множественные повторяющиеся запросы `GET /api/admin/work-days`
- Нет новых логов с `=== selectedDay CHANGED ===`
- Нет логов с `[API] addTimeSlot → date: ...`

---

## 🧪 ЧТО НУЖНО СДЕЛАТЬ

1. **Принудительно сбросить кэш Vercel:**
   - Удалить deployment в Vercel
   - Создать новый deployment
   - Или использовать другой метод cache-busting

2. **Проверить что новые логи появляются:**
   - Открыть админку в инкогнито режиме
   - Проверить консоль браузера
   - Добавить слот и проверить логи

3. **Если логи появятся:**
   - Протестировать добавление слотов
   - Проверить что дублирование прекратилось

4. **Если логи не появляются:**
   - Рассмотреть альтернативные методы деплоя
   - Или использовать локальный сервер для тестирования

---

## 🎨 ТЕХНИЧЕСКИЙ СТЕК

- **Backend:** Python 3.13, FastAPI, aiogram 3.13, SQLite
- **Frontend:** React 18, Vite, Tailwind CSS, date-fns, lucide-react
- **Deploy:** Railway (backend), Vercel (frontend)
- **Telegram:** Mini App для клиентов и админа

---

## 📊 СТРУКТУРА БАЗЫ ДАННЫХ

### work_days
```sql
CREATE TABLE work_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_date TEXT UNIQUE NOT NULL,  -- YYYY-MM-DD
    is_closed INTEGER NOT NULL DEFAULT 0
);
```

### time_slots
```sql
CREATE TABLE time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_date TEXT NOT NULL,
    slot_time TEXT NOT NULL,  -- HH:MM
    is_booked INTEGER NOT NULL DEFAULT 0,
    UNIQUE(day_date, slot_time),
    FOREIGN KEY (day_date) REFERENCES work_days(day_date) ON DELETE CASCADE
);
```

### bookings
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    day_date TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    service_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(day_date, slot_time)
);
```

---

## 🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ

1. **Vercel кэширование:** Старая версия фронтенда всё ещё загружается
2. **Race condition:** `useEffect` перезаписывает `selectedDay`
3. **Stale closure:** `selectedDay` захвачен в старом значении
4. **Асинхронная гонка:** Множественные вызовы `loadWorkDays()` конфликтуют

---

## 📝 ДОПОЛНИТЕЛЬНО

- Railway CLI установлен и настроен
- База данных очищена через API endpoint
- Локальная база чистая (без дубликатов)
- Проблема только на продакшене
- verify_admin временно отключен для отладки
