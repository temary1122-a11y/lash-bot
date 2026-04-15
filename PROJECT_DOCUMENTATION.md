# Lash Bot - Полная документация проекта

## 📋 Обзор проекта

**Lash Bot** - это система бронирования для салона ресниц, состоящая из:
- Telegram бота для клиентов
- Telegram Mini App для клиентов (веб-приложение)
- Telegram Mini App для администратора
- FastAPI бэкенда
- SQLite базы данных

---

## 🏗️ Архитектура проекта

### Структура директорий

```
lash_bot/
├── bot.py                    # Главный файл Telegram бота
├── api/                      # FastAPI бэкенд
│   ├── app.py               # Точка входа FastAPI
│   ├── routes/              # API endpoints
│   │   ├── booking.py       # Эндпоинты для записи
│   │   └── admin.py         # Эндпоинты для админки
│   └── models.py            # Pydantic модели
├── database/                 # Работа с БД
│   └── db.py                # Все SQL запросы и функции
├── handlers/                 # Обработчики Telegram бота
│   ├── common.py            # Общие команды (/start, /menu)
│   ├── booking.py           # FSM для записи клиентов
│   └── admin.py             # Админские команды
├── keyboards/                # Inline клавиатуры
│   └── inline.py            # Все клавиатуры
├── mini-app/                 # React Mini App
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   │   ├── App.jsx      # Главный компонент
│   │   │   ├── Calendar.jsx # Календарь для клиентов
│   │   │   ├── TimeSlots.jsx # Слоты времени
│   │   │   ├── BookingForm.jsx # Форма записи
│   │   │   ├── AdminPanel.jsx # Админ-панель
│   │   │   └── AdminSchedulePanel.jsx # Управление расписанием
│   │   ├── api/
│   │   │   └── client.js    # API клиент
│   │   └── index.css        # Глобальные стили
│   ├── tailwind.config.js   # Конфигурация Tailwind
│   └── package.json
├── config.py                 # Конфигурация бота
├── requirements.txt         # Python зависимости
└── .env                     # Переменные окружения
```

---

## 🔧 Технологический стек

### Бэкенд
- **Python 3.13**
- **FastAPI** - веб-фреймворк
- **aiogram 3.13** - Telegram бот
- **SQLite** - база данных
- **uvicorn** - ASGI сервер
- **Pydantic** - валидация данных

### Фронтенд (Mini App)
- **React 18**
- **Vite** - сборщик
- **Tailwind CSS** - стили
- **date-fns** - работа с датами
- **lucide-react** - иконки
- **@telegram-apps/sdk** - Telegram WebApp API

### Деплой
- **Railway** - бэкенд
- **Vercel** - фронтенд

---

## 🗄️ База данных (SQLite)

### Таблицы

#### 1. `work_days` - Рабочие дни
```sql
CREATE TABLE work_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_date TEXT UNIQUE NOT NULL,  -- YYYY-MM-DD
    is_closed INTEGER NOT NULL DEFAULT 0  -- 0 = открыт, 1 = закрыт
);
```

#### 2. `time_slots` - Временные слоты
```sql
CREATE TABLE time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_date TEXT NOT NULL,
    slot_time TEXT NOT NULL,  -- HH:MM
    is_booked INTEGER NOT NULL DEFAULT 0,  -- 0 = свободен, 1 = занят
    UNIQUE(day_date, slot_time),
    FOREIGN KEY (day_date) REFERENCES work_days(day_date) ON DELETE CASCADE
);
```

#### 3. `bookings` - Записи клиентов
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    day_date TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    service_id TEXT,  -- ID услуги (новое поле)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(day_date, slot_time)
);
```

---

## 🔌 API Endpoints

### Клиентские endpoints (`/api/booking`)

#### GET `/api/booking/available-dates`
- Возвращает доступные даты и слоты для клиентов
- Использует `get_available_work_days()` - только будущие открытые дни
- Response: `List[WorkDay]`

#### POST `/api/booking/book`
- Создаёт запись клиента
- Request: `BookingRequest` (date, time, name, phone, service_id)
- Response: `BookingResponse`

#### GET `/api/booking/my-bookings/{userId}`
- Возвращает записи пользователя
- Response: `List[MyBooking]`

#### DELETE `/api/booking/cancel/{bookingId}`
- Отменяет запись

### Админские endpoints (`/api/admin`)

#### GET `/api/admin/settings`
- Возвращает настройки GUI (цвета, услуги)
- Response: `GUISettings`

#### POST `/api/admin/settings`
- Обновляет настройки GUI
- Request: `GUISettings`

#### GET `/api/admin/work-days`
- Возвращает ВСЕ рабочие дни (для админки)
- Использует `get_all_work_days()` - все дни без ограничений
- Response: `List[WorkDayInfo]`

#### POST `/api/admin/add-work-day`
- Добавляет рабочий день
- Request: `AddWorkDayRequest` (date, time_slots)
- Response: `{"success": bool, "message": str}`

#### POST `/api/admin/add-time-slot`
- Добавляет временной слот
- Request: `AddTimeSlotRequest` (date, time)
- Response: `{"success": bool, "message": str}`

#### POST `/api/admin/delete-time-slot`
- Удаляет временной слот
- Request: `DeleteTimeSlotRequest` (date, time)
- Response: `{"success": bool, "message": str}`

#### POST `/api/admin/delete-work-day`
- Удаляет рабочий день
- Request: `DeleteWorkDayRequest` (day_date)
- Response: `{"success": bool, "message": str}`

#### GET `/api/admin/bookings/{date}`
- Возвращает записи на конкретную дату
- Response: `List[Booking]`

#### POST `/api/admin/close-day`
- Закрывает рабочий день
- Request: `{"date": str}`

#### POST `/api/admin/open-day`
- Открывает рабочий день
- Request: `{"date": str}`

---

## 📊 Pydantic Модели

### Service
```python
class Service(BaseModel):
    id: str
    name: str
    price: int
```

### TimeSlot
```python
class TimeSlot(BaseModel):
    time: str
    available: bool
```

### WorkDay
```python
class WorkDay(BaseModel):
    date: str
    slots: List[TimeSlot]
    is_closed: bool = False
```

### BookingRequest
```python
class BookingRequest(BaseModel):
    date: str
    time: str
    name: str
    phone: str
    service_id: str  # Новое поле
```

### AddWorkDayRequest
```python
class AddWorkDayRequest(BaseModel):
    date: str
    time_slots: list[str] | None = None
```

### AddTimeSlotRequest
```python
class AddTimeSlotRequest(BaseModel):
    date: str
    time: str
```

### DeleteTimeSlotRequest
```python
class DeleteTimeSlotRequest(BaseModel):
    date: str
    time: str
```

### WorkDayInfo
```python
class WorkDayInfo(BaseModel):
    date: str
    is_closed: bool
    slots: list[dict]  # [{"time": "HH:MM", "is_booked": bool}]
```

### GUISettings
```python
class GUISettings(BaseModel):
    background_color: str = "#ffffff"
    primary_color: str = "#6366f1"
    secondary_color: str = "#8b5cf6"
    text_color: str = "#1f2937"
    calendar_style: str = "modern"
    background_image: Optional[str] = None
    services: List[Service] = []  # Новое поле
```

---

## 🔑 Ключевые функции базы данных

### Рабочие дни
- `add_work_day(day_date, time_slots)` - добавляет рабочий день
- `delete_work_day(day_date)` - удаляет рабочий день
- `get_all_work_days()` - возвращает ВСЕ дни (для админки)
- `get_available_work_days()` - возвращает только будущие открытые дни (для клиентов)
- `close_day(day_date)` - закрывает день
- `open_day(day_date)` - открывает день

### Слоты
- `add_time_slot(day_date, slot_time)` - добавляет слот
- `delete_time_slot(day_date, slot_time)` - удаляет слот
- `get_free_slots(day_date)` - возвращает свободные слоты
- `get_all_slots(day_date)` - возвращает все слоты (для админки)

### Записи
- `create_booking(user_id, username, client_name, phone, day_date, slot_time, service_id)` - создаёт запись
- `get_user_booking(user_id)` - возвращает записи пользователя
- `cancel_booking_by_id(booking_id)` - отменяет запись

---

## 🎨 Фронтенд компоненты

### App.jsx
- Главный компонент
- Управляет режимом (админ/клиент)
- Проверяет userId для определения режима
- Загружает данные из API
- Управляет состоянием формы записи

### Calendar.jsx
- Календарь для клиентов
- Отображает даты с слотами
- Показывает до 3 слотов в ячейке
- Кнопка "+X ещё" кликабельна - открывает все слоты
- Скрывает занятые слоты

### TimeSlots.jsx
- Список слотов для выбранной даты
- Показывает только свободные слоты
- При клике открывает форму записи

### BookingForm.jsx
- Форма записи клиента
- Автозаполняет имя из Telegram WebApp
- Выбор услуги с ценником
- Отправляет данные на `/api/booking/book`

### AdminPanel.jsx
- Админская панель
- Управление настройками GUI
- Управление расписанием через AdminSchedulePanel
- УБРАНЫ кнопки выбора стиля календаря

### AdminSchedulePanel.jsx
- Управление расписанием
- Календарь с рабочими днями
- Добавление/удаление слотов
- Отображение записей при клике на дату
- УБРАНА легенда календаря
- Показывает записи с кликабельным username

---

## 🐛 Текущие проблемы

### 1. Ошибка 422 при добавлении/удалении слотов
**Проблема:** API endpoints возвращают 422 Unprocessable Content
**Возможные причины:**
- Несоответствие формата данных между фронтендом и бэкендом
- Проблема с Pydantic валидацией
- Отсутствие x-admin-id header

**Логи:**
```
POST /api/admin/add-time-slot 422
POST /api/admin/delete-time-slot 422
```

### 2. userId: undefined
**Проблема:** Telegram WebApp не передаёт userId локально
**Решение:** В продакшене через Telegram это будет работать

**Логи:**
```
GET /api/booking/my-bookings/undefined 422
```

---

## 🔒 Конфигурация

### Переменные окружения
```env
BOT_TOKEN=telegram_bot_token
ADMIN_ID=8736987138
DATABASE_PATH=/data/lash_bot.db
```

### Константы
```python
ADMIN_ID = 8736987138
DEFAULT_TIME_SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']
```

---

## 🚀 Деплой

### Бэкенд (Railway)
- URL: https://lashes-production-3342.up.railway.app
- Команда: `railway up`
- Команда запуска: `uvicorn api.app:app --host 0.0.0.0 --port $PORT`

### Фронтенд (Vercel)
- URL: https://mini-app-gamma-ashen.vercel.app
- Команда: `vercel --prod`
- Backend URL: https://lashes-production-3342.up.railway.app

---

## 📝 Логика работы

### Клиентская запись
1. Клиент открывает Mini App
2. Загружаются доступные даты (только будущие открытые)
3. Клиент выбирает дату → видит слоты
4. Клиент выбирает слот → открывается форма
5. Клиент заполняет форму (имя автозаполняется, выбирает услугу)
6. Данные отправляются на `/api/booking/book`
7. Слот помечается как занят

### Админское управление
1. Админ открывает Mini App
2. Видит календарь со всеми днями
3. Клик на дату → видит слоты и записи
4. Может добавлять/удалять слоты
5. Может закрывать/открывать дни
6. Видит записи с кликабельным username

---

## 💡 Важные особенности

1. **Две функции для рабочих дней:**
   - `get_all_work_days()` - для админки (все дни)
   - `get_available_work_days()` - для клиентов (только будущие открытые)

2. **Telegram WebApp:**
   - Автозаполнение имени работает только через Telegram
   - Локально userId всегда 0
   - requestContact не поддерживается в текущей версии

3. **Услуги:**
   - Добавлены в GUISettings
   - Выбираются при записи
   - Сохраняются в bookings.service_id

4. **UI изменения:**
   - Убраны кнопки стиля календаря в админке
   - Убрана легенда календаря в админке
   - Кнопка "+X ещё" кликабельна

---

## 🔍 Отладка

### Логи на бэкенде
Добавлены print statements для отладки:
- `DEBUG add-work-day`
- `DEBUG add-time-slot`
- `DEBUG delete-time-slot`

### Логи на фронтенде
API клиент логирует все запросы в консоль браузера

---

## 📞 Контактная информация

- **Admin ID:** 8736987138
- **Backend URL:** https://lashes-production-3342.up.railway.app
- **Frontend URL:** https://mini-app-gamma-ashen.vercel.app
