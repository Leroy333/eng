const express = require('express');
const cors = require('cors');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBHOOK_URL || `http://localhost:${PORT}/webapp`;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is required!');
  console.log('Please create a .env file with your bot token');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Telegram Web App endpoint
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// API endpoints for Telegram bot
app.post('/api/user', (req, res) => {
  const { telegramId, username, firstName, lastName } = req.body;
  
  console.log('User data:', { telegramId, username, firstName, lastName });
  
  res.json({ success: true, message: 'User data received' });
});

app.get('/api/user/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  
  const userData = {
    telegramId,
    newWordsCount: 20,
    currentPage: 'onboarding'
  };
  
  res.json(userData);
});

app.post('/api/progress', (req, res) => {
  const { telegramId, wordId, status } = req.body;
  
  console.log('Progress update:', { telegramId, wordId, status });
  
  res.json({ success: true, message: 'Progress updated' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Telegram Bot Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `Привет, ${firstName}! 👋\n\nДобро пожаловать в EngCard - приложение для изучения английского языка! 🎓\n\nНажмите кнопку ниже, чтобы начать изучение:`;
  
  // В команде /start замените web_app на url
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Начать изучение',
            url: 'http://localhost:3001'  // Прямая ссылка на dev сервер
          }
        ]
      ]
    }
  };
  
  bot.sendMessage(chatId, welcomeMessage, options);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `📚 EngCard - Помощь\n\n` +
    `Доступные команды:\n` +
    `• /start - Начать работу с ботом\n` +
    `• /help - Показать это сообщение\n` +
    `• /progress - Показать ваш прогресс\n\n` +
    `Для начала изучения нажмите кнопку "Начать изучение" в главном меню.`;
  
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/progress/, (msg) => {
  const chatId = msg.chat.id;
  
  const progressMessage = `📊 Ваш прогресс:\n\n` +
    `• Изучено слов: 0\n` +
    `• Новых слов: 20\n` +
    `• Текущая тема: Начальный уровень\n\n` +
    `Продолжайте изучение для улучшения результатов! 💪`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📖 Продолжить изучение',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  };
  
  bot.sendMessage(chatId, progressMessage, options);
});

// Handle web app data
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  console.log('Web app data received:', data);
  
  if (data.action === 'completed_lesson') {
    bot.sendMessage(chatId, `🎉 Отлично! Вы изучили ${data.wordsLearned} новых слов!`);
  }
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Web App available at: http://localhost:${PORT}/webapp`);
  console.log(`🤖 Telegram bot is running...`);
  console.log(`🔗 Web App URL for bot: ${webAppUrl}`);
});
