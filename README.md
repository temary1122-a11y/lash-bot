# Lash Bot - Telegram Bot for Eyelash Extensions Booking

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-2CA5E0.svg)](https://core.telegram.org/bots)

A Telegram bot for automating eyelash extensions booking. Clients can choose dates and times through an interactive Mini App with liquid glass design, while masters manage schedules through an admin panel.

## ✨ Features

### For Clients:
- 📅 Interactive calendar for date selection
- 🕐 Choose convenient time slots
- 👤 Enter name and phone number
- ✅ Confirm bookings
- ❌ Cancel own bookings
- 💰 View price list
- 🖼 View portfolio
- ⏰ Automatic reminders 24h before appointment

### For Administrators:
- ➕ Add working days
- 🗑 Delete time slots
- 🔒/🔓 Close/open days
- 📋 View schedule
- ❌ Cancel client bookings with reason
- 📢 Publish schedule to channel
- 🎨 Liquid glass design Mini App
- 🔧 Manage booking dates through admin panel
- 📊 View booking history and analytics
- 📋 View cancelled bookings with reasons

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Telegram User ID (from [@userinfobot](https://t.me/userinfobot))

### Installation

```bash
# Clone the repository
git clone https://github.com/temary1122-a11y/lash-bot.git
cd lash_bot

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd mini-app
npm install
cd ..
```

### Configuration

```bash
# Copy environment file
copy .env.example .env

# Edit .env with your values
# BOT_TOKEN=your_bot_token
# ADMIN_ID=your_telegram_user_id
# CHANNEL_ID=@your_channel
```

### Running

```bash
# Run all services automatically
powershell -ExecutionPolicy Bypass -File start.ps1

# Or manually:
# Terminal 1: Backend API
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd mini-app
npm run dev

# Terminal 3: Telegram Bot
python bot.py
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
lash_bot/
├── bot.py                 # Telegram bot entry point
├── config.py              # Configuration
├── states.py              # FSM states
├── database/
│   └── db.py             # SQLite database operations
├── handlers/
│   ├── common.py         # Common handlers
│   ├── booking.py        # Booking handlers
│   └── admin.py          # Admin handlers
├── keyboards/
│   ├── inline.py         # Inline keyboards
│   └── calendars.py      # Calendar keyboards
├── utils/
│   ├── helpers.py        # Helper functions
│   └── scheduler.py      # APScheduler
├── api/                  # FastAPI backend for Mini App
│   ├── app.py
│   ├── models.py
│   └── routes/
├── mini-app/             # React Mini App
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── api/         # API client
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── requirements.txt      # Python dependencies
├── start.ps1            # Startup script
├── build.ps1            # Build script
└── DEPLOYMENT.md        # Deployment guide
```

## 🛠 Tech Stack

### Backend:
- **Python 3.13** - Programming language
- **aiogram 3.x** - Telegram Bot Framework
- **FastAPI** - API for Mini App
- **SQLite** - Database
- **APScheduler** - Task scheduler for reminders
- **python-dotenv** - Environment variables

### Frontend:
- **React 19** - UI library
- **Vite 7** - Build tool
- **TailwindCSS 4** - Styling with liquid glass design
- **Telegram Web Apps SDK** - Telegram integration
- **Framer Motion** - Animations
- **date-fns 4** - Date utilities
- **lucide-react** - Icons

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy:
1. **Frontend** → Vercel (free)
2. **Backend** → Render (free)
3. **Bot** → Same server as backend

### Free Hosting Options:
- **Vercel**: https://vercel.com (frontend)
- **Render**: https://render.com (backend)
- **Netlify**: https://netlify.com (frontend)

## 📝 Mini App Features

- Beautiful interactive calendar
- Time slot selection
- Customizable design (colors, background)
- Admin panel for date management
- Responsive interface
- Telegram Web Apps integration

## 🔒 Security

- Environment variables for sensitive data
- Admin authentication via Telegram ID
- CORS configuration
- SQL injection prevention

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [aiogram](https://aiogram.dev) - Telegram Bot framework
- [FastAPI](https://fastapi.tiangolo.com) - Modern web framework
- [Vite](https://vitejs.dev) - Next generation frontend tooling
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section in README

## ☕ Support Development

If this project helped you or your business, consider supporting its development:

### GitHub Sponsors
- **GitHub Sponsors:** [Sponsor on GitHub](https://github.com/sponsors/temary1122-a11y)

### Cryptocurrency (no sanctions)
- **USDT (TRC20):** `TUTexaGzjjNMVmBF8Nt3QgPmfG17sxQzJ2`
- **USDT (ERC20):** `0x50ff8865d79d437d8c38f83d040eb3dd10c68a93`
- **Ethereum (ETH):** `0x50ff8865d79d437d8c38f83d040eb3dd10c68a93`

Your support helps maintain and improve the bot!

## 🗺 Roadmap

- [ ] Payment integration
- [ ] Multi-location support
- [ ] Client reviews
- [ ] Analytics dashboard
- [ ] SMS notifications
- [ ] Mobile app (React Native)

---

Made with ❤️ for lash artists
