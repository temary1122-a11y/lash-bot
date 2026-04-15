# ============================================================
# api/app.py — FastAPI приложение
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import booking, admin

app = FastAPI(title="Lash Bot API", version="1.0.0")

# CORS настройка для Mini App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(booking.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    """Корневой endpoint"""
    return {"message": "Lash Bot API", "status": "running"}


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}
