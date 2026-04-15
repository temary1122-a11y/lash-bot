import sqlite3
from datetime import datetime

def cleanup_database():
    """Очистка базы данных от дубликатов и фиктивных записей"""

    conn = sqlite3.connect('lash_bot.db')
    cursor = conn.cursor()

    print("🔍 Проверка дубликатов...")

    # Найти дубликаты в time_slots
    cursor.execute("""
        SELECT day_date, slot_time, COUNT(*) as count
        FROM time_slots
        GROUP BY day_date, slot_time
        HAVING count > 1
    """)
    duplicates = cursor.fetchall()

    if duplicates:
        print(f"❌ Найдено {len(duplicates)} дубликатов в time_slots:")
        for day, time, count in duplicates:
            print(f"  - {day} {time}: {count} записей")
    else:
        print("✅ Дубликатов в time_slots не найдено")

    # Найти дубликаты в bookings
    cursor.execute("""
        SELECT day_date, slot_time, COUNT(*) as count
        FROM bookings
        GROUP BY day_date, slot_time
        HAVING count > 1
    """)
    booking_duplicates = cursor.fetchall()

    if booking_duplicates:
        print(f"❌ Найдено {len(booking_duplicates)} дубликатов в bookings:")
        for day, time, count in booking_duplicates:
            print(f"  - {day} {time}: {count} записей")
    else:
        print("✅ Дубликатов в bookings не найдено")

    # Показать статистику до очистки
    cursor.execute("SELECT COUNT(*) FROM work_days")
    work_days_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM time_slots")
    time_slots_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM bookings")
    bookings_count = cursor.fetchone()[0]

    print(f"\n📊 Статистика ДО очистки:")
    print(f"  - work_days: {work_days_count}")
    print(f"  - time_slots: {time_slots_count}")
    print(f"  - bookings: {bookings_count}")

    # Удалить дубликаты (оставить только последние)
    print("\n🧹 Очистка дубликатов...")

    cursor.execute("""
        DELETE FROM time_slots
        WHERE id NOT IN (
            SELECT MAX(id)
            FROM time_slots
            GROUP BY day_date, slot_time
        )
    """)
    deleted_slots = cursor.rowcount
    print(f"✅ Удалено {deleted_slots} дублирующихся слотов")

    cursor.execute("""
        DELETE FROM bookings
        WHERE id NOT IN (
            SELECT MAX(id)
            FROM bookings
            GROUP BY day_date, slot_time
        )
    """)
    deleted_bookings = cursor.rowcount
    print(f"✅ Удалено {deleted_bookings} дублирующихся записей")

    # Удалить orphan слоты (без work_day)
    cursor.execute("""
        DELETE FROM time_slots
        WHERE day_date NOT IN (SELECT day_date FROM work_days)
    """)
    orphan_slots = cursor.rowcount
    print(f"✅ Удалено {orphan_slots} orphan слотов")

    conn.commit()

    # Показать статистику после очистки
    cursor.execute("SELECT COUNT(*) FROM work_days")
    work_days_count_after = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM time_slots")
    time_slots_count_after = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM bookings")
    bookings_count_after = cursor.fetchone()[0]

    print(f"\n📊 Статистика ПОСЛЕ очистки:")
    print(f"  - work_days: {work_days_count_after}")
    print(f"  - time_slots: {time_slots_count_after}")
    print(f"  - bookings: {bookings_count_after}")

    conn.close()
    print("\n✅ База данных очищена!")

if __name__ == "__main__":
    cleanup_database()
