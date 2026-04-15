-- Скрипт для очистки продакшен базы данных от дубликатов и фиктивных записей
-- Выполни через Railway Console или Railway CLI

-- 1. Проверка дубликатов в time_slots
SELECT day_date, slot_time, COUNT(*) as count
FROM time_slots
GROUP BY day_date, slot_time
HAVING count > 1;

-- 2. Проверка дубликатов в bookings
SELECT day_date, slot_time, COUNT(*) as count
FROM bookings
GROUP BY day_date, slot_time
HAVING count > 1;

-- 3. Удаление дубликатов в time_slots (оставить последние)
DELETE FROM time_slots
WHERE id NOT IN (
    SELECT MAX(id)
    FROM time_slots
    GROUP BY day_date, slot_time
);

-- 4. Удаление дубликатов в bookings (оставить последние)
DELETE FROM bookings
WHERE id NOT IN (
    SELECT MAX(id)
    FROM bookings
    GROUP BY day_date, slot_time
);

-- 5. Удаление orphan слотов (без work_day)
DELETE FROM time_slots
WHERE day_date NOT IN (SELECT day_date FROM work_days);

-- 6. Удаление work_days без слотов (опционально)
DELETE FROM work_days
WHERE NOT EXISTS (
    SELECT 1 FROM time_slots WHERE time_slots.day_date = work_days.day_date
);

-- 7. Проверка результата
SELECT 'work_days' as table_name, COUNT(*) as count FROM work_days
UNION ALL
SELECT 'time_slots', COUNT(*) FROM time_slots
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;
