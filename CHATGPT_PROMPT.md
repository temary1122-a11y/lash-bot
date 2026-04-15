# PROMPT для ChatGPT - Lash Bot Project

## 🎯 ОПИСАНИЕ ПРОБЛЕМЫ

У меня есть система бронирования для салона ресниц (Telegram Mini App + FastAPI бэкенд + SQLite). Есть критическая проблема:

**ПРОБЛЕМА:** При добавлении слота через админку, записи дублируются на другие даты. Например:
- Добавляю слот на 23 число в 23:00
- Слот добавляется на 16 число вместо 23
- Через некоторое время записи копируются на 4-5 дней подряд
- В итоге месяц забит фиктивными записями

**Симптомы:**
1. При клике на дату в календаре, selectedDay может перезаписываться на другую дату
2. Бэкенд работает корректно (логи Railway показывают правильные даты)
3. Проблема 100% на фронтенде с состоянием React
4. Новые логи (=== selectedDay CHANGED ===) не появляются в консоли - возможно фронтенд кэшируется

---

## 📋 ПОЛНОЕ ОПИСАНИЕ ПРОЕКТА

### Технологический стек
- **Бэкенд:** Python 3.13, FastAPI, aiogram 3.13, SQLite
- **Фронтенд:** React 18, Vite, Tailwind CSS, date-fns, lucide-react
- **Деплой:** Railway (бэкенд), Vercel (фронтенд)
- **Telegram:** Mini App для клиентов и админа

### Структура проекта

```
lash_bot/
├── bot.py                    # Главный файл Telegram бота
├── api/                      # FastAPI бэкенд
│   ├── app.py               # Точка входа FastAPI
│   ├── routes/
│   │   ├── booking.py       # Эндпоинты для записи
│   │   └── admin.py         # Эндпоинты для админки
│   └── models.py            # Pydantic модели
├── database/
│   └── db.py                # Все SQL запросы
├── handlers/                # Обработчики Telegram бота
├── keyboards/                # Inline клавиатуры
├── mini-app/                 # React Mini App
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx      # Главный компонент
│   │   │   ├── Calendar.jsx # Календарь для клиентов
│   │   │   ├── AdminPanel.jsx # Админ-панель
│   │   │   └── AdminSchedulePanel.jsx # Управление расписанием (ПРОБЛЕМА ЗДЕСЬ)
│   │   └── api/
│   │       └── client.js    # API клиент
└── config.py
```

### База данных (SQLite)

#### Таблица work_days
```sql
CREATE TABLE work_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_date TEXT UNIQUE NOT NULL,  -- YYYY-MM-DD
    is_closed INTEGER NOT NULL DEFAULT 0
);
```

#### Таблица time_slots
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

#### Таблица bookings
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

## 🔌 API ENDPOINTS

### Админские endpoints

#### POST /api/admin/add-time-slot
```python
@router.post("/add-time-slot")
async def add_time_slot_endpoint(request: AddTimeSlotRequest, x_admin_id: int = Header(None)):
    await verify_admin(x_admin_id)
    success = add_time_slot(request.date, request.time)
```

**Pydantic модель:**
```python
class AddTimeSlotRequest(BaseModel):
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
```

#### GET /api/admin/work-days
Возвращает ВСЕ рабочие дни для админки (без фильтрации по месяцу).

#### POST /api/admin/delete-time-slot
```python
class DeleteTimeSlotRequest(BaseModel):
    date: str
    time: str
```

---

## 🎨 FRONTEND КОД

### AdminSchedulePanel.jsx (где проблема)

**Состояние:**
```javascript
const [selectedDay, setSelectedDay] = useState(null);
const [workDays, setWorkDays] = useState([]);
const [daySlots, setDaySlots] = useState([]);
```

**useEffect для загрузки workDays:**
```javascript
useEffect(() => {
  loadWorkDays();
}, [currentMonth]);
```

**loadWorkDays функция:**
```javascript
const loadWorkDays = async () => {
  try {
    setLoading(true);
    const data = await apiClient.getWorkDays(adminId);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const filteredDays = data.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= monthStart && dayDate <= monthEnd;
    });

    setWorkDays(filteredDays);
  } catch (error) {
    console.error('Error loading work days:', error);
  } finally {
    setLoading(false);
  }
};
```

**handleDayClick - при клике на дату:**
```javascript
const handleDayClick = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log('=== DAY CLICKED ===');
  console.log('Date object:', date);
  console.log('Date string:', dateStr);
  console.log('Setting selectedDay to:', dateStr);
  setSelectedDay(dateStr);
  setActiveTab('slots');
  loadDaySlots(dateStr);
  loadDayBookings(dateStr);
  setShowBookings(true);
};
```

**handleAddSlot - при добавлении слота:**
```javascript
const handleAddSlot = async () => {
  if (!selectedDay || !newSlot) return;

  try {
    setLoading(true);
    console.log('=== ADDING SLOT ===');
    console.log('selectedDay:', selectedDay);
    console.log('newSlot:', newSlot);

    await apiClient.addWorkDay(selectedDay, [], adminId);
    await apiClient.addTimeSlot(adminId, selectedDay, newSlot);
    setNewSlot('');
    loadDaySlots(selectedDay);
  } catch (error) {
    console.error('Error adding slot:', error);
  } finally {
    setLoading(false);
  }
};
```

### client.js - API клиент

**addTimeSlot метод:**
```javascript
async addTimeSlot(adminId, date, time) {
  return this.request('/api/admin/add-time-slot', {
    method: 'POST',
    body: JSON.stringify({ date, time }),
    headers: {
      'x-admin-id': adminId,
    },
  });
}
```

**request метод:**
```javascript
async request(endpoint, options = {}) {
  const url = `${this.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || `HTTP ${response.status}`);
  }
  return data;
}
```

---

## 🔍 ЛОГИ RAILWAY (бэкенд работает правильно)

```
DEBUG add-time-slot: request=date='2026-04-23' time='11:11', x_admin_id=8736987138
INFO:     100.64.0.22:48096 - "POST /api/admin/add-time-slot HTTP/1.1" 200 OK
```

Бэкенд получает ПРАВИЛЬНУЮ дату (2026-04-23) и успешно добавляет слот.

---

## 🐛 ЛОГИ БРАУЗЕРА (проблема на фронтенде)

```
client.js:15 API Request: GET /api/admin/work-days
client.js:15 API Request: POST /api/admin/add-work-day
client.js:15 API Request: POST /api/admin/add-time-slot
client.js:15 API Request: GET /api/admin/work-days
```

Новые логи с === selectedDay CHANGED === не появляются - возможно фронтенд кэшируется.

---

## 💡 ВОЗМОЖНЫЕ ПРИЧИНЫ

1. **useEffect перезаписывает selectedDay:** Когда loadWorkDays() вызывается, он может перезаписывать состояние
2. **Проблема с замыканиями:** selectedDay может быть захвачен в старом значении
3. **Асинхронная гонка:** Множественные вызовы loadWorkDays() могут конфликтовать
4. **Кэширование Vercel:** Фронтенд не обновляется

---

## 🎯 ЧТО НУЖНО СДЕЛАТЬ

1. Проанализировать код AdminSchedulePanel.jsx на предмет проблем с состоянием
2. Найти почему selectedDay перезаписывается
3. Предложить исправление для предотвращения дублирования записей
4. Предложить как очистить базу данных от фиктивных записей

---

## 📁 КЛЮЧЕВЫЕ ФАЙЛЫ ДЛЯ АНАЛИЗА

1. `mini-app/src/components/AdminSchedulePanel.jsx` - компонент с проблемой
2. `mini-app/src/api/client.js` - API клиент
3. `api/routes/admin.py` - админские endpoints
4. `database/db.py` - функции работы с БД

---

## 🔗 URL

- **Бэкенд:** https://lashes-production-3342.up.railway.app
- **Фронтенд:** https://mini-app-gamma-ashen.vercel.app
- **Admin ID:** 8736987138

---

## 📝 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ

- Локальная база данных чистая (без дубликатов)
- Проблема только на продакшене (Railway)
- verify_admin полностью отключен для отладки
- Кнопка "+X ещё" в клиентском календаре была исправлена
- Порядок аргументов в addTimeSlot/deleteTimeSlot исправлен

Пожалуйста, проанализируй код и предложи решение проблемы с дублированием записей.
