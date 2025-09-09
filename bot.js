const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBHOOK_URL || 'https://your-domain.com/webapp';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is required!');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `Привет, ${firstName}! 👋\n\nДобро пожаловать в EngCard - приложение для изучения английского языка! 🎓\n\nНажмите кнопку ниже, чтобы начать изучение:`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Начать изучение',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  };
  
  bot.sendMessage(chatId, welcomeMessage, options);
});

// Help command
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

// Progress command
bot.onText(/\/progress/, (msg) => {
  const chatId = msg.chat.id;
  
  // Here you would fetch user progress from database
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
  
  // Process the data from web app
  if (data.action === 'completed_lesson') {
    bot.sendMessage(chatId, `🎉 Отлично! Вы изучили ${data.wordsLearned} новых слов!`);
  }
});

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  
  if (data === 'start_learning') {
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Открыть приложение',
              web_app: { url: webAppUrl }
            }
          ]
        ]
      }
    };
    
    bot.editMessageText('Нажмите кнопку ниже, чтобы открыть приложение:', {
      chat_id: message.chat.id,
      message_id: message.message_id,
      ...options
    });
  }
  
  bot.answerCallbackQuery(callbackQuery.id);
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Telegram bot is running...');
console.log(`Web App URL: ${webAppUrl}`);

module.exports = bot;
