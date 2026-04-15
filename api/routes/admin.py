# ============================================================
# api/routes/admin.py — Routes для админки
# ============================================================

from fastapi import APIRouter, HTTPException, Header
from api.models import (
    GUISettings,
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
gui_settings = GUISettings()


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
    print(f"DEBUG add-work-day: request={request}")

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
async def add_time_slot_endpoint(request: dict, x_admin_id: int = Header(None)):
    """Добавить временной слот"""
    await verify_admin(x_admin_id)
    print(f"DEBUG add-time-slot: request={request}")

    date = request.get("date")
    time = request.get("time")

    if not date or not time:
        raise HTTPException(status_code=422, detail="date and time are required")

    success = add_time_slot(date, time)
    if success:
        return {"success": True, "message": "Слот добавлен"}
    else:
        return {"success": False, "message": "Слот уже существует или день не найден"}


@router.post("/delete-time-slot")
async def delete_time_slot_endpoint(request: DeleteTimeSlotRequest, x_admin_id: int = Header(None)):
    """Удалить временной слот"""
    await verify_admin(x_admin_id)

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
        result.append(
            WorkDayInfo(
                date=day[1],
                is_closed=bool(day[2]),
                slots=[slot[1] for slot in slots],  # slot[1] = slot_time
            )
        )
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
        return {"success": False, "message": "День не найден"}
