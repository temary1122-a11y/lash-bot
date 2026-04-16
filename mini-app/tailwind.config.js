/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warm: {
          // Фоны
          bg:        '#e8d0bc',   // основной фон приложения
          'bg-deep': '#d4b99e',   // более тёмный акцент фона
          // Карточки
          card:      '#f0e6d8',   // карточка дня (светлая)
          'card-2':  '#ede0d0',   // чуть темнее
          cream:     '#f7f0e8',   // очень светлый крем
          // Текст
          brown:     '#2c1f14',   // тёмно-коричневый текст
          'brown-2': '#4a3728',   // средне-коричневый
          'brown-3': '#7a6455',   // мягкий коричневый (дни недели)
          muted:     '#b09a8a',   // приглушённый (неактивные)
          // Слоты
          'slot-bg':    '#8fa87a',  // основной цвет слота (оливковый)
          'slot-light': '#a8c490',  // светлее
          'slot-text':  '#1a2e12',  // текст на слоте
          // Акценты
          emerald:   '#5a9e6e',   // изумрудный плюсик
          danger:    '#e05252',   // красная корзина
        },
      },
      backdropBlur: {
        '3xl': '28px',
        '4xl': '40px',
      },
      boxShadow: {
        'warm-sm':  '0 2px 8px 0 rgba(120, 80, 40, 0.08)',
        'warm-md':  '0 4px 16px 0 rgba(120, 80, 40, 0.12)',
        'warm-lg':  '0 8px 32px 0 rgba(120, 80, 40, 0.16)',
        'warm-xl':  '0 12px 40px 0 rgba(100, 60, 20, 0.20)',
        'warm-inset': 'inset 0 1px 0 rgba(255, 248, 240, 0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Display', 'BlinkMacSystemFont',
               'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
