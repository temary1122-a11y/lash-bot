import requests

# Получаем все рабочие дни
response = requests.get("https://lashes-production-3342.up.railway.app/api/admin/work-days", headers={"x-admin-id": "8736987138"})
work_days = response.json()

print(f"Всего рабочих дней: {len(work_days)}")
print("\nРабочие дни:")
for day in work_days:
    print(f"  Дата: {day['date']}, Закрыт: {day['is_closed']}, Слотов: {len(day.get('slots', []))}")
    if day.get('slots'):
        print(f"    Слоты: {[s['time'] for s in day['slots']]}")

# Проверяем дубликаты слотов
from collections import defaultdict
slot_dates = defaultdict(list)
for day in work_days:
    for slot in day.get('slots', []):
        slot_dates[slot['time']].append(day['date'])

print("\n🔍 Проверка дубликатов слотов:")
for time, dates in slot_dates.items():
    if len(dates) > 1:
        print(f"  ⚠️  Слот {time} найден на {len(dates)} датах: {dates}")
