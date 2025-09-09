# EngCard - Telegram Bot для изучения английского языка

Telegram бот для изучения английского языка с современным Web App интерфейсом, созданный с использованием React, TypeScript, Effector и Node.js.

## Технологический стек

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Effector** - управление состоянием
- **Styled Components** - стилизация
- **Vite** - сборщик и dev сервер
- **Lucide React** - иконки

### Backend
- **Node.js** - серверная платформа
- **Express** - веб-фреймворк
- **node-telegram-bot-api** - Telegram Bot API
- **CORS** - для кросс-доменных запросов

## Установка и настройка

### 1. Создание Telegram бота

1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен

### 2. Настройка проекта

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd engcard
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

4. Заполните переменные в `.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webapp
PORT=3001
NODE_ENV=development
```

### 3. Запуск приложения

#### Режим разработки:
```bash
# Запуск фронтенда
npm run dev

# В другом терминале - запуск бота
npm run bot
```

#### Продакшн режим:
```bash
# Сборка и запуск
npm start
```

## Структура проекта

```
├── src/                    # Frontend (React)
│   ├── components/         # React компоненты
│   │   ├── OnboardingScreen.tsx
│   │   └── DashboardScreen.tsx
│   ├── store/             # Effector stores
│   │   ├── app.ts
│   │   ├── topics.ts
│   │   └── index.ts
│   ├── styles/            # Стили и тема
│   │   ├── theme.ts
│   │   ├── GlobalStyles.tsx
│   │   └── styled.d.ts
│   ├── App.tsx            # Главный компонент
│   └── main.tsx           # Точка входа
├── index.js               # Backend сервер
├── bot.js                 # Telegram бот
├── server.js              # Express сервер
└── package.json           # Зависимости и скрипты
```

## Функциональность

### Telegram Bot
- **Команды**: `/start`, `/help`, `/progress`
- **Web App интеграция** - открытие приложения в Telegram
- **Обработка данных** от Web App
- **Уведомления** о прогрессе

### Web App (Frontend)
- **Экран онбординга** с анимированными эмодзи
- **Главный экран** с темами изучения
- **Адаптивный дизайн** для мобильных устройств
- **Современные анимации** и переходы

### API Endpoints
- `POST /api/user` - сохранение данных пользователя
- `GET /api/user/:telegramId` - получение данных пользователя
- `POST /api/progress` - обновление прогресса
- `GET /health` - проверка состояния сервера

## Развертывание

### Локальное тестирование
1. Используйте [ngrok](https://ngrok.com/) для создания туннеля:
```bash
ngrok http 3001
```

2. Обновите `TELEGRAM_WEBHOOK_URL` в `.env` на URL от ngrok

### Продакшн развертывание
1. Разверните на VPS или облачном сервисе (Heroku, Railway, etc.)
2. Настройте домен и SSL сертификат
3. Обновите переменные окружения
4. Запустите приложение

## Команды бота

- `/start` - Начать работу с ботом
- `/help` - Показать справку
- `/progress` - Показать прогресс изучения

## Следующие шаги

1. **База данных** - интеграция с PostgreSQL/MySQL
2. **Аутентификация** - система пользователей
3. **Прогресс** - отслеживание изученных слов
4. **Словарь** - база английских слов с переводами
5. **Spaced Repetition** - система повторений
6. **Статистика** - аналитика прогресса
7. **Уведомления** - напоминания о занятиях

## Лицензия

MIT License
