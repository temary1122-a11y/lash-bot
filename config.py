# ============================================================
# config.py — Конфигурация бота
# ============================================================

import os
from dotenv import load_dotenv

load_dotenv()

# ── Токен бота (получить у @BotFather) ──────────────────────
BOT_TOKEN: str = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")

# ── ID администратора (ваш Telegram user_id) ────────────────
ADMIN_ID: int = int(os.getenv("ADMIN_ID", "123456789"))

# ── Канал с расписанием (например: @my_channel или -100xxxxxxxxxx) ─
SCHEDULE_CHANNEL_ID: str = os.getenv("SCHEDULE_CHANNEL_ID", "@your_schedule_channel")

# ── Канал для обязательной подписки ─────────────────────────
CHANNEL_ID: str = os.getenv("CHANNEL_ID", "@your_channel")          # username или числовой ID
CHANNEL_LINK: str = os.getenv("CHANNEL_LINK", "https://t.me/your_channel")

# ── Путь к базе данных SQLite ────────────────────────────────
DB_PATH: str = os.getenv("DB_PATH", "lash_bot.db")

# ── Прайс-лист (HTML) ────────────────────────────────────────
PRICE_TEXT: str = (
    "💅 <b>Прайс-лист на наращивание ресниц</b>\n\n"
    "╔══════════════════════════╗\n"
    "║  <b>2D</b>  —  <b>2 000 руб.</b>           ║\n"
    "║  <b>3D</b>  —  <b>2 500 руб.</b>           ║\n"
    "╚══════════════════════════╝\n\n"
    "✨ В стоимость входит:\n"
    "• Подбор изгиба и длины\n"
    "• Профессиональные материалы\n"
    "• Коррекция формы\n\n"
    "📞 Для уточнения деталей — записывайтесь через бота!"
)

# ── Ссылка на портфолио ──────────────────────────────────────
PORTFOLIO_LINK: str = "https://ru.pinterest.com/crystalwithluv/_created/"

# ── Рабочие часы по умолчанию (используются при инициализации) ─
DEFAULT_TIME_SLOTS: list[str] = [
    "09:00", "10:30", "12:00", "13:30",
    "15:00", "16:30", "18:00", "19:30",
]

# ── Горизонт записи (дней вперёд) ────────────────────────────
BOOKING_HORIZON_DAYS: int = 30
