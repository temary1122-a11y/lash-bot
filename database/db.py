# ============================================================
# database/db.py — Инициализация БД и все SQL-операции
# ============================================================

import sqlite3
import logging
from contextlib import contextmanager
from datetime import date, datetime
from typing import Optional

from config import DB_PATH

logger = logging.getLogger(__name__)


# ────────────────────────────────────────────────────────────
# Контекстный менеджер подключения
# ────────────────────────────────────────────────────────────
@contextmanager
def get_conn():
    """Возвращает соединение с автокоммитом/откатом."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# ────────────────────────────────────────────────────────────
# Создание таблиц
# ────────────────────────────────────────────────────────────
def init_db() -> None:
    """Создаёт все нужные таблицы, если они не существуют."""
    with get_conn() as conn:
        conn.executescript("""
            -- Рабочие дни
            CREATE TABLE IF NOT EXISTS work_days (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                day_date  TEXT    UNIQUE NOT NULL,   -- YYYY-MM-DD
                is_closed INTEGER NOT NULL DEFAULT 0 -- 1 = день закрыт
            );

            -- Временные слоты
            CREATE TABLE IF NOT EXISTS time_slots (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                day_date  TEXT    NOT NULL,           -- YYYY-MM-DD
                slot_time TEXT    NOT NULL,           -- HH:MM
                is_booked INTEGER NOT NULL DEFAULT 0, -- 1 = занят
                UNIQUE(day_date, slot_time),
                FOREIGN KEY (day_date) REFERENCES work_days(day_date) ON DELETE CASCADE
            );

            -- Записи клиентов
            CREATE TABLE IF NOT EXISTS bookings (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id      INTEGER NOT NULL,
                username     TEXT,
                client_name  TEXT    NOT NULL,
                phone        TEXT    NOT NULL,
                day_date     TEXT    NOT NULL,
                slot_time    TEXT    NOT NULL,
                created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
                UNIQUE(day_date, slot_time)
            );
        """)
    logger.info("БД инициализирована.")


# ────────────────────────────────────────────────────────────
# Рабочие дни
# ────────────────────────────────────────────────────────────
def add_work_day(day_date: str, time_slots: list[str] | None = None) -> bool:
    """
    Добавляет рабочий день и (опционально) временные слоты.
    Возвращает True если день добавлен, False если уже существует.
    """
    with get_conn() as conn:
        try:
            conn.execute(
                "INSERT INTO work_days (day_date) VALUES (?)",
                (day_date,)
            )
            if time_slots:
                conn.executemany(
                    "INSERT OR IGNORE INTO time_slots (day_date, slot_time) VALUES (?, ?)",
                    [(day_date, t) for t in time_slots]
                )
            return True
        except sqlite3.IntegrityError:
            return False


def close_day(day_date: str) -> None:
    """Закрывает рабочий день (все слоты становятся недоступны)."""
    with get_conn() as conn:
        conn.execute(
            "UPDATE work_days SET is_closed = 1 WHERE day_date = ?",
            (day_date,)
        )


def open_day(day_date: str) -> None:
    """Открывает ранее закрытый рабочий день."""
    with get_conn() as conn:
        conn.execute(
            "UPDATE work_days SET is_closed = 0 WHERE day_date = ?",
            (day_date,)
        )


def get_available_days() -> list[sqlite3.Row]:
    """Возвращает открытые рабочие дни с хотя бы одним свободным слотом."""
    with get_conn() as conn:
        return conn.execute("""
            SELECT DISTINCT wd.day_date
            FROM work_days wd
            JOIN time_slots ts ON ts.day_date = wd.day_date
            WHERE wd.is_closed = 0
              AND ts.is_booked = 0
              AND wd.day_date >= date('now', 'localtime')
            ORDER BY wd.day_date
        """).fetchall()


def get_all_work_days() -> list[sqlite3.Row]:
    """Возвращает все рабочие дни (для админ-панели)."""
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM work_days WHERE day_date >= date('now','localtime') ORDER BY day_date"
        ).fetchall()


def day_exists(day_date: str) -> bool:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM work_days WHERE day_date = ?", (day_date,)
        ).fetchone()
        return row is not None


# ────────────────────────────────────────────────────────────
# Временные слоты
# ────────────────────────────────────────────────────────────
def add_time_slot(day_date: str, slot_time: str) -> bool:
    """Добавляет слот в рабочий день. True = успех."""
    with get_conn() as conn:
        try:
            conn.execute(
                "INSERT INTO time_slots (day_date, slot_time) VALUES (?, ?)",
                (day_date, slot_time)
            )
            return True
        except sqlite3.IntegrityError:
            return False


def delete_time_slot(day_date: str, slot_time: str) -> bool:
    """Удаляет слот (только если он не забронирован). True = успех."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT is_booked FROM time_slots WHERE day_date=? AND slot_time=?",
            (day_date, slot_time)
        ).fetchone()
        if row is None:
            return False
        if row["is_booked"]:
            return False
        conn.execute(
            "DELETE FROM time_slots WHERE day_date=? AND slot_time=?",
            (day_date, slot_time)
        )
        return True


def delete_work_day(day_date: str) -> bool:
    """Удаляет рабочий день со всеми слотами. True = успех."""
    with get_conn() as conn:
        # Сначала удаляем все слоты этого дня
        conn.execute("DELETE FROM time_slots WHERE day_date=?", (day_date,))
        # Затем удаляем сам рабочий день
        cursor = conn.execute("DELETE FROM work_days WHERE day_date=?", (day_date,))
        return cursor.rowcount > 0


def get_free_slots(day_date: str) -> list[sqlite3.Row]:
    """Возвращает свободные слоты на указанный день."""
    with get_conn() as conn:
        return conn.execute("""
            SELECT ts.*
            FROM time_slots ts
            JOIN work_days wd ON wd.day_date = ts.day_date
            WHERE ts.day_date = ?
              AND ts.is_booked = 0
              AND wd.is_closed = 0
            ORDER BY ts.slot_time
        """, (day_date,)).fetchall()


def get_all_slots(day_date: str) -> list[sqlite3.Row]:
    """Все слоты на день (для просмотра в админке)."""
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM time_slots WHERE day_date = ? ORDER BY slot_time",
            (day_date,)
        ).fetchall()


# ────────────────────────────────────────────────────────────
# Записи клиентов
# ────────────────────────────────────────────────────────────
def create_booking(
    user_id: int,
    username: Optional[str],
    client_name: str,
    phone: str,
    day_date: str,
    slot_time: str,
) -> Optional[int]:
    """
    Создаёт запись клиента.
    Возвращает booking_id или None если слот уже занят.
    """
    with get_conn() as conn:
        # Проверяем, не занят ли слот
        slot = conn.execute(
            "SELECT is_booked FROM time_slots WHERE day_date=? AND slot_time=?",
            (day_date, slot_time)
        ).fetchone()
        if slot is None or slot["is_booked"]:
            return None

        try:
            cursor = conn.execute(
                """INSERT INTO bookings
                   (user_id, username, client_name, phone, day_date, slot_time)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (user_id, username, client_name, phone, day_date, slot_time)
            )
            booking_id = cursor.lastrowid
            # Помечаем слот как занятый
            conn.execute(
                "UPDATE time_slots SET is_booked=1 WHERE day_date=? AND slot_time=?",
                (day_date, slot_time)
            )
            return booking_id
        except sqlite3.IntegrityError:
            return None


def get_user_booking(user_id: int) -> Optional[sqlite3.Row]:
    """Возвращает активную запись пользователя (если есть)."""
    with get_conn() as conn:
        return conn.execute("""
            SELECT b.*
            FROM bookings b
            JOIN work_days wd ON wd.day_date = b.day_date
            WHERE b.user_id = ?
              AND b.day_date >= date('now', 'localtime')
            ORDER BY b.day_date, b.slot_time
            LIMIT 1
        """, (user_id,)).fetchone()


def cancel_booking_by_user(user_id: int) -> Optional[sqlite3.Row]:
    """
    Отменяет запись пользователя.
    Возвращает данные отменённой записи или None.
    """
    with get_conn() as conn:
        booking = conn.execute("""
            SELECT * FROM bookings
            WHERE user_id = ?
              AND day_date >= date('now', 'localtime')
            ORDER BY day_date, slot_time
            LIMIT 1
        """, (user_id,)).fetchone()
        if booking is None:
            return None
        conn.execute("DELETE FROM bookings WHERE id=?", (booking["id"],))
        conn.execute(
            "UPDATE time_slots SET is_booked=0 WHERE day_date=? AND slot_time=?",
            (booking["day_date"], booking["slot_time"])
        )
        return booking


def cancel_booking_by_id(booking_id: int) -> Optional[sqlite3.Row]:
    """Отменяет запись по ID (для администратора)."""
    with get_conn() as conn:
        booking = conn.execute(
            "SELECT * FROM bookings WHERE id=?", (booking_id,)
        ).fetchone()
        if booking is None:
            return None
        conn.execute("DELETE FROM bookings WHERE id=?", (booking_id,))
        conn.execute(
            "UPDATE time_slots SET is_booked=0 WHERE day_date=? AND slot_time=?",
            (booking["day_date"], booking["slot_time"])
        )
        return booking


def get_bookings_for_day(day_date: str) -> list[sqlite3.Row]:
    """Все записи на указанный день."""
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM bookings WHERE day_date=? ORDER BY slot_time",
            (day_date,)
        ).fetchall()


def get_booking_by_id(booking_id: int) -> Optional[sqlite3.Row]:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM bookings WHERE id=?", (booking_id,)
        ).fetchone()


def get_all_future_bookings() -> list[sqlite3.Row]:
    """Все будущие записи (для восстановления задач APScheduler)."""
    with get_conn() as conn:
        return conn.execute("""
            SELECT * FROM bookings
            WHERE day_date >= date('now', 'localtime')
            ORDER BY day_date, slot_time
        """).fetchall()


def user_has_active_booking(user_id: int) -> bool:
    """Проверяет, есть ли у пользователя активная запись."""
    return get_user_booking(user_id) is not None
