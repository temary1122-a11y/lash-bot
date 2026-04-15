# ============================================================
# api/routes/booking.py — Routes для записи
# ============================================================

from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta

from api.models import WorkDay, TimeSlot, BookingRequest, BookingResponse, MyBooking
from database.db import (
    get_all_work_days,
    get_free_slots,
    create_booking,
    get_user_booking,
    cancel_booking_by_id,
)

router = APIRouter(prefix="/api/booking", tags=["booking"])


@router.get("/available-dates", response_model=List[WorkDay])
async def get_available_dates():
    """Получить доступные даты и слоты"""
    try:
        work_days = get_all_work_days()
        result = []

        for day in work_days:
            slots = get_free_slots(day[1])  # day[1] = day_date
            time_slots = [
                TimeSlot(time=slot[2], available=True)  # slot[2] = slot_time (исправлено)
                for slot in slots
            ]
            result.append(
                WorkDay(
                    date=day[1],  # day_date
                    slots=time_slots,
                    is_closed=bool(day[2])  # is_closed
                )
            )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/book", response_model=BookingResponse)
async def create_booking_endpoint(booking: BookingRequest):
    """Создать запись"""
    try:
        # Проверяем доступность слота
        available_slots = get_free_slots(booking.date)
        slot_times = [slot[1] for slot in available_slots]  # slot[1] = slot_time
        if booking.time not in slot_times:
            return BookingResponse(
                success=False,
                message="Этот слот недоступен"
            )

        # Создаём запись (user_id=0 для Mini App, username=None)
        booking_id = create_booking(
            user_id=0,
            username=None,
            client_name=booking.name,
            phone=booking.phone,
            day_date=booking.date,
            slot_time=booking.time
        )

        if booking_id is None:
            return BookingResponse(
                success=False,
                message="Слот уже занят"
            )

        return BookingResponse(
            success=True,
            message="Запись успешно создана",
            booking_id=booking_id
        )
    except ValueError:
        return BookingResponse(
            success=False,
            message="Неверный формат даты. Используйте ГГГГ-ММ-ДД"
        )
    except Exception as e:
        return BookingResponse(
            success=False,
            message=f"Ошибка: {str(e)}"
        )


@router.get("/my-bookings/{user_id}", response_model=List[MyBooking])
async def get_my_bookings(user_id: int):
    """Получить записи пользователя"""
    try:
        booking = get_user_booking(user_id)
        if not booking:
            return []

        return [
            MyBooking(
                id=booking[0],  # id
                date=booking[5],  # day_date
                time=booking[6],  # slot_time
                name=booking[3],  # client_name
                phone=booking[4]  # phone
            )
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cancel/{booking_id}")
async def cancel_booking_endpoint(booking_id: int):
    """Отменить запись"""
    try:
        result = cancel_booking_by_id(booking_id)
        if result is None:
            return {"success": False, "message": "Запись не найдена"}
        return {"success": True, "message": "Запись отменена"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
