# ============================================================
# api/routes/admin.py — Routes для админки
# ============================================================

from fastapi import APIRouter, HTTPException, Header
from api.models import (
    GUISettings,
    Service,
    AddWorkDayRequest,
    AddTimeSlotRequest,
    DeleteTimeSlotRequest,
    DeleteWorkDayRequest,
    WorkDayInfo,
)
from database.db import (
    add_work_day,
    add_time_slot,
    delete_time_slot,
    delete_work_day,
    get_all_slots,
    get_all_work_days,
    close_day,
    open_day,
)
from config import ADMIN_ID

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Временное хранилище настроек (в продакшене — в БД)
gui_settings = GUISettings(
    services=[
        Service(id="classic", name="Классические ресницы", price=2000),
        Service(id="volume", name="Объемные ресницы", price=3000),
        Service(id="2d", name="2D эффект", price=3500),
        Service(id="3d", name="3D эффект", price=4000),
        Service(id="removal", name="Снятие ресниц", price=500),
    ]
)


async def verify_admin(x_admin_id: int = Header(None, description="Admin ID for authentication")):
    """Проверка админ-прав"""
    # Полностью отключено для отладки Railway deployment
    pass


@router.get("/settings", response_model=GUISettings)
async def get_gui_settings():
    """Получить настройки GUI"""
    return gui_settings


@router.post("/settings", response_model=GUISettings)
async def update_gui_settings(settings: GUISettings):
    """Обновить настройки GUI"""
    global gui_settings
    gui_settings = settings

    # В продакшене здесь будет сохранение в БД
    # save_gui_settings_to_db(settings)

    return gui_settings


@router.post("/add-work-day")
async def add_work_day_endpoint(request: dict, x_admin_id: int = Header(None)):
    """Добавить рабочий день"""
    await verify_admin(x_admin_id)
    print(f"DEBUG add-work-day: request={request}, x_admin_id={x_admin_id}")

    date = request.get("date")
    time_slots = request.get("time_slots")

    if not date:
        raise HTTPException(status_code=422, detail="date is required")

    # Если time_slots не указаны или "default", используем стандартные
    if not time_slots or time_slots == ["default"]:
        from config import DEFAULT_TIME_SLOTS
        time_slots = DEFAULT_TIME_SLOTS

    success = add_work_day(date, time_slots)
    if success:
        return {"success": True, "message": "Рабочий день добавлен"}
    else:
        return {"success": False, "message": "День уже существует"}


@router.post("/add-time-slot")
async def add_time_slot_endpoint(request: AddTimeSlotRequest, x_admin_id: int = Header(None)):
    """Добавить временной слот"""
    await verify_admin(x_admin_id)
    print(f"DEBUG add-time-slot: request={request}, x_admin_id={x_admin_id}")

    success = add_time_slot(request.date, request.time)
    if success:
        return {"success": True, "message": "Слот добавлен"}
    else:
        return {"success": False, "message": "Слот уже существует или день не найден"}


@router.post("/delete-time-slot")
async def delete_time_slot_endpoint(request: DeleteTimeSlotRequest, x_admin_id: int = Header(None)):
    """Удалить временной слот"""
    await verify_admin(x_admin_id)
    print(f"DEBUG delete-time-slot: request={request}, x_admin_id={x_admin_id}")

    success = delete_time_slot(request.date, request.time)
    if success:
        return {"success": True, "message": "Слот удалён"}
    else:
        return {"success": False, "message": "Слот занят или не найден"}


@router.get("/work-days", response_model=list[WorkDayInfo])
async def get_work_days_endpoint(x_admin_id: int = Header(None)):
    """Получить все рабочие дни"""
    await verify_admin(x_admin_id)

    work_days = get_all_work_days()
    result = []
    for day in work_days:
        slots = get_all_slots(day[1])  # day[1] = day_date
        # Формируем слоты с полной информацией
        slot_info = []
        for slot in slots:
            slot_info.append({
                'time': slot[2],  # slot_time
                'is_booked': bool(slot[3])  # is_booked
            })
        result.append(
            WorkDayInfo(
                date=day[1],
                is_closed=bool(day[2]),
                slots=slot_info,
            )
        )
    return result


@router.get("/bookings/{date}")
async def get_bookings_for_date(date: str, x_admin_id: int = Header(None)):
    """Получить записи на конкретную дату"""
    await verify_admin(x_admin_id)

    from database.db import get_conn

    with get_conn() as conn:
        bookings = conn.execute(
            """SELECT id, user_id, username, client_name, phone, day_date, slot_time, service_id
               FROM bookings WHERE day_date = ? ORDER BY slot_time""",
            (date,)
        ).fetchall()

        result = []
        for booking in bookings:
            result.append({
                'id': booking[0],
                'user_id': booking[1],
                'username': booking[2],
                'client_name': booking[3],
                'phone': booking[4],
                'day_date': booking[5],
                'slot_time': booking[6],
                'service_id': booking[7],
            })

        return result


@router.post("/close-day")
async def close_day_endpoint(request: dict, x_admin_id: int = Header(None)):
    """Закрыть рабочий день"""
    await verify_admin(x_admin_id)
    date = request.get("date")
    if not date:
        raise HTTPException(status_code=422, detail="date is required")
    close_day(date)
    return {"success": True, "message": "День закрыт"}


@router.post("/open-day")
async def open_day_endpoint(request: dict, x_admin_id: int = Header(None)):
    """Открыть рабочий день"""
    await verify_admin(x_admin_id)
    date = request.get("date")
    if not date:
        raise HTTPException(status_code=422, detail="date is required")
    open_day(date)
    return {"success": True, "message": "День открыт"}


@router.post("/delete-work-day")
async def delete_work_day_endpoint(request: DeleteWorkDayRequest, x_admin_id: int = Header(None)):
    """Удалить рабочий день"""
    await verify_admin(x_admin_id)
    success = delete_work_day(request.day_date)
    if success:
        return {"success": True, "message": "Рабочий день удалён"}
    else:
        return {"success": False, "message": "Рабочий день не найден"}


@router.post("/cleanup-database")
async def cleanup_database_endpoint(x_admin_id: int = Header(None)):
    """Очистить базу данных от дубликатов"""
    await verify_admin(x_admin_id)

    import sqlite3
    from database.db import get_conn

    with get_conn() as conn:
        cursor = conn.cursor()

        # Удаление дубликатов в time_slots
        cursor.execute("""
            DELETE FROM time_slots
            WHERE id NOT IN (
                SELECT MAX(id)
                FROM time_slots
                GROUP BY day_date, slot_time
            )
        """)
        deleted_slots = cursor.rowcount

        # Удаление дубликатов в bookings
        cursor.execute("""
            DELETE FROM bookings
            WHERE id NOT IN (
                SELECT MAX(id)
                FROM bookings
                GROUP BY day_date, slot_time
            )
        """)
        deleted_bookings = cursor.rowcount

        # Удаление orphan слотов
        cursor.execute("""
            DELETE FROM time_slots
            WHERE day_date NOT IN (SELECT day_date FROM work_days)
        """)
        orphan_slots = cursor.rowcount

        conn.commit()

        # Получаем статистику
        cursor.execute("SELECT COUNT(*) FROM work_days")
        work_days_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM time_slots")
        time_slots_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM bookings")
        bookings_count = cursor.fetchone()[0]

        return {
            "success": True,
            "deleted_slots": deleted_slots,
            "deleted_bookings": deleted_bookings,
            "orphan_slots": orphan_slots,
            "stats": {
                "work_days": work_days_count,
                "time_slots": time_slots_count,
                "bookings": bookings_count
            }
        }
