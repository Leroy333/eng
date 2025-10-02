import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import XLSX from 'xlsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Импорт модулей для работы с базой данных
import { testConnection, query } from './dist/database/connection.js';
import { UserRepository, WordRepository, TopicRepository, UserProgressRepository, StudySessionRepository, StatsRepository } from './dist/database/repositories.js';

// Создание экземпляров репозиториев
const userRepository = new UserRepository();
const wordRepository = new WordRepository();
const topicRepository = new TopicRepository();
const userProgressRepository = new UserProgressRepository();
const studySessionRepository = new StudySessionRepository();
const statsRepository = new StatsRepository();

const app = express();
const PORT = process.env.PORT || 3001;

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Только Excel файлы (.xlsx, .xls) разрешены'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Проверка подключения к базе данных при запуске
testConnection().then(success => {
  if (success) {
    console.log('✅ Database connection established');
  } else {
    console.log('❌ Database connection failed');
  }
});

// Serve the React app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Telegram Web App endpoint
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// API endpoints для работы с темами
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await topicRepository.findAll();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.get('/api/topics/:id', async (req, res) => {
  try {
    const topic = await topicRepository.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// API endpoints для работы со словами
app.get('/api/words', async (req, res) => {
  try {
    const words = await wordRepository.findAll();
    res.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

app.get('/api/words/topic/:topicId', async (req, res) => {
  try {
    const words = await wordRepository.findByTopic(req.params.topicId);
    res.json(words);
  } catch (error) {
    console.error('Error fetching words by topic:', error);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

app.get('/api/words/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const words = await wordRepository.searchWords(q);
    res.json(words);
  } catch (error) {
    console.error('Error searching words:', error);
    res.status(500).json({ error: 'Failed to search words' });
  }
});

// API endpoints для работы с пользователями
app.post('/api/users', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, languageCode } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    let user = await userRepository.findByTelegramId(telegramId);
    if (!user) {
      user = await userRepository.createUser({
        telegramId,
        username,
        firstName,
        lastName,
        languageCode
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error creating/fetching user:', error);
    res.status(500).json({ error: 'Failed to process user data' });
  }
});

app.get('/api/users/telegram/:telegramId', async (req, res) => {
  try {
    const user = await userRepository.findByTelegramId(parseInt(req.params.telegramId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// API endpoints для работы с прогрессом пользователей
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const progress = await userProgressRepository.findByUser(parseInt(req.params.userId));
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

app.get('/api/users/:userId/progress/topic/:topicId', async (req, res) => {
  try {
    const progress = await userProgressRepository.findByUserAndTopic(
      parseInt(req.params.userId),
      req.params.topicId
    );
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress by topic:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

app.post('/api/users/:userId/progress/answer', async (req, res) => {
  try {
    const { wordId, isCorrect } = req.body;
    const userId = parseInt(req.params.userId);
    
    if (!wordId || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ error: 'wordId and isCorrect are required' });
    }

    // Получаем слово для получения topicId
    const word = await wordRepository.findById(wordId);
    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }
    
    const progress = await userProgressRepository.updateProgress(userId, wordId, word.topic_id, isCorrect);
    res.json(progress);
  } catch (error) {
    console.error('Error recording answer:', error);
    res.status(500).json({ error: 'Failed to record answer' });
  }
});

// API endpoints для работы с сессиями изучения
app.post('/api/users/:userId/sessions', async (req, res) => {
  try {
    const { topicId, wordsStudied, correctAnswers, incorrectAnswers, sessionDuration } = req.body;
    const userId = parseInt(req.params.userId);
    
    if (!topicId) {
      return res.status(400).json({ error: 'topicId is required' });
    }

    const session = await studySessionRepository.createSession(
      userId,
      topicId,
      {
        wordsStudied,
        correctAnswers,
        incorrectAnswers,
        sessionDuration
      }
    );
    
    res.json(session);
  } catch (error) {
    console.error('Error creating study session:', error);
    res.status(500).json({ error: 'Failed to create study session' });
  }
});

app.get('/api/users/:userId/sessions', async (req, res) => {
  try {
    const { limit } = req.query;
    const sessions = await studySessionRepository.findByUser(
      parseInt(req.params.userId),
      limit ? parseInt(limit) : 10
    );
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
});

app.put('/api/sessions/:sessionId/complete', async (req, res) => {
  try {
    const { duration } = req.body;
    const sessionId = parseInt(req.params.sessionId);
    
    if (!duration) {
      return res.status(400).json({ error: 'duration is required' });
    }

    const session = await studySessionRepository.update(sessionId, {
      session_duration: duration,
      completed_at: new Date()
    });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// API endpoints для статистики
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const stats = await userProgressRepository.getMasteryStats(parseInt(req.params.userId));
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

app.get('/api/topics/:topicId/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await statsRepository.getTopicStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching topic stats:', error);
    res.status(500).json({ error: 'Failed to fetch topic stats' });
  }
});

// API endpoints для прогресса
app.get('/api/users/:userId/topics/progress', async (req, res) => {
  try {
    const userProgressRepo = new UserProgressRepository();
    const progress = await userProgressRepo.getAllTopicsProgress(parseInt(req.params.userId));
    res.json(progress);
  } catch (error) {
    console.error('Error fetching topics progress:', error);
    res.status(500).json({ error: 'Failed to fetch topics progress' });
  }
});

app.get('/api/users/:userId/topics/:topicId/progress', async (req, res) => {
  try {
    const userProgressRepo = new UserProgressRepository();
    const progress = await userProgressRepo.getTopicProgress(
      parseInt(req.params.userId),
      req.params.topicId
    );
    res.json(progress);
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    res.status(500).json({ error: 'Failed to fetch topic progress' });
  }
});

app.get('/api/users/:userId/topics/:topicId/words/progress', async (req, res) => {
  try {
    const userProgressRepo = new UserProgressRepository();
    const progress = await userProgressRepo.getWordsProgress(
      parseInt(req.params.userId),
      req.params.topicId
    );
    res.json(progress);
  } catch (error) {
    console.error('Error fetching words progress:', error);
    res.status(500).json({ error: 'Failed to fetch words progress' });
  }
});

app.post('/api/users/:userId/words/:wordId/learned', async (req, res) => {
  try {
    const userProgressRepo = new UserProgressRepository();
    const progress = await userProgressRepo.markWordAsLearned(
      parseInt(req.params.userId),
      req.params.wordId
    );
    res.json(progress);
  } catch (error) {
    console.error('Error marking word as learned:', error);
    res.status(500).json({ error: 'Failed to mark word as learned' });
  }
});

app.post('/api/users/:userId/words/:wordId/studying', async (req, res) => {
  try {
    const userProgressRepo = new UserProgressRepository();
    const progress = await userProgressRepo.markWordAsStudying(
      parseInt(req.params.userId),
      req.params.wordId
    );
    res.json(progress);
  } catch (error) {
    console.error('Error marking word as studying:', error);
    res.status(500).json({ error: 'Failed to mark word as studying' });
  }
});

// Импорт топика из Excel файла
app.post('/api/import/topic', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }

    console.log('📁 Получен файл для импорта:', req.file.originalname);

    // Читаем Excel файл
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // Получаем листы
    console.log('📋 Доступные листы:', workbook.SheetNames);
    
    const topicsSheet = workbook.Sheets['Topics'];
    const wordsSheet = workbook.Sheets['Words'];

    if (!topicsSheet || !wordsSheet) {
      console.log('❌ Листы не найдены. Доступные:', workbook.SheetNames);
      return res.status(400).json({ 
        error: `Файл должен содержать листы "Topics" и "Words". Найдены: ${workbook.SheetNames.join(', ')}` 
      });
    }

    // Конвертируем в JSON
    const topicsData = XLSX.utils.sheet_to_json(topicsSheet);
    const wordsData = XLSX.utils.sheet_to_json(wordsSheet);

    console.log('📊 Данные из Topics:', topicsData);
    console.log('📝 Данные из Words:', wordsData.length, 'слов');

    if (topicsData.length === 0) {
      return res.status(400).json({ error: 'Лист "Topics" пуст' });
    }

    if (wordsData.length === 0) {
      return res.status(400).json({ error: 'Лист "Words" пуст' });
    }

    const topicData = topicsData[0]; // Берем первый топик
    console.log('📋 Данные топика:', topicData);

    // Валидация данных топика
    if (!topicData) {
      return res.status(400).json({ 
        error: 'Данные топика не найдены' 
      });
    }

    if (!topicData.id || !topicData.name || !topicData.icon || !topicData.emoji) {
      console.log('❌ Отсутствующие поля в топике:', {
        id: topicData.id,
        name: topicData.name,
        icon: topicData.icon,
        emoji: topicData.emoji
      });
      return res.status(400).json({ 
        error: `Топик должен содержать поля: id, name, icon, emoji. Найдено: ${JSON.stringify(topicData)}` 
      });
    }

    // Валидация данных слов
    const requiredWordFields = ['id', 'russian', 'english', 'topic_id'];
    for (const word of wordsData) {
      for (const field of requiredWordFields) {
        if (!word[field]) {
          return res.status(400).json({ 
            error: `Слово должно содержать поле: ${field}` 
          });
        }
      }
    }

    console.log('📊 Импортируем топик:', topicData.name, 'со словами:', wordsData.length);

    // Импортируем в базу данных
    const result = await TopicRepository.importFromExcel(topicData, wordsData);

    console.log('✅ Топик успешно импортирован:', result.topic?.name || 'Неизвестно', 'слова:', result.wordsCount);

    res.json({
      success: true,
      topic: result.topic,
      wordsCount: result.wordsCount,
      message: `Топик "${result.topic?.name || 'Неизвестно'}" успешно импортирован с ${result.wordsCount} словами`
    });

  } catch (error) {
    console.error('❌ Ошибка при импорте топика:', error);
    res.status(500).json({ 
      error: 'Ошибка при импорте топика: ' + (error.message || 'Неизвестная ошибка')
    });
  }
});

// API для получения прогресса всех слов пользователя
app.get('/api/users/:userId/words/progress', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('📊 Получаем прогресс всех слов для пользователя:', userId);

    const result = await query(`
      SELECT 
        w.id as word_id,
        COALESCE(up.learned, 0) as learned,
        CASE WHEN up.user_id IS NOT NULL AND up.learned = 0 THEN 1 ELSE 0 END as studying
      FROM words w
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
      ORDER BY w.russian
    `, [userId]);

    const wordsProgress = result.rows;

    console.log(`✅ Найдено прогресса для слов: ${wordsProgress.length}`);

    res.json({
      success: true,
      wordsProgress: wordsProgress,
      message: `Найдено прогресса для ${wordsProgress.length} слов`
    });

  } catch (error) {
    console.error('❌ Ошибка при получении прогресса слов:', error);
    res.status(500).json({
      error: 'Ошибка при получении прогресса слов: ' + (error.message || 'Неизвестная ошибка')
    });
  }
});

// API для получения общего прогресса пользователя
app.get('/api/users/:userId/overall-progress', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('📊 Получаем общий прогресс для пользователя:', userId);

    const result = await query(`
      SELECT 
        COUNT(DISTINCT w.id) as total_words,
        COUNT(CASE WHEN up.learned = 1 THEN 1 END) as learned_words,
        COUNT(CASE WHEN up.learned = 0 AND up.user_id IS NOT NULL THEN 1 END) as studying_words,
        COUNT(CASE WHEN up.user_id IS NULL THEN 1 END) as new_words,
        CASE 
          WHEN COUNT(DISTINCT w.id) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN up.learned = 1 THEN 1 END) * 100.0 / COUNT(DISTINCT w.id)), 2)
        END as progress_percentage
      FROM words w
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
    `, [userId]);

    const progress = result.rows[0];

    console.log(`✅ Общий прогресс пользователя:`, progress);

    res.json({
      success: true,
      progress: progress,
      message: `Общий прогресс: ${progress.learned_words}/${progress.total_words} слов изучено`
    });

  } catch (error) {
    console.error('❌ Ошибка при получении общего прогресса:', error);
    res.status(500).json({
      error: 'Ошибка при получении общего прогресса: ' + (error.message || 'Неизвестная ошибка')
    });
  }
});

// API endpoint для получения рекомендованных слов
app.get('/api/users/:userId/recommended-words', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('🔍 Получаем рекомендованные слова для пользователя:', userId);
    
    // Получаем все слова с информацией о прогрессе пользователя
    const result = await query(`
      SELECT 
        w.id,
        w.russian,
        w.english,
        w.topic_id,
        w.difficulty_level,
        w.pronunciation,
        w.example_sentence,
        w.usage_frequency,
        t.name as topic_name,
        t.icon as topic_icon,
        t.color as topic_color,
        COALESCE(up.mastery_level, 0) as mastery_level,
        COALESCE(up.correct_attempts, 0) as correct_attempts,
        COALESCE(up.incorrect_attempts, 0) as incorrect_attempts,
        up.last_studied,
        CASE 
          WHEN up.mastery_level >= 80 THEN 'learned'
          WHEN up.mastery_level > 0 THEN 'studying'
          ELSE 'new'
        END as status,
        CASE 
          WHEN up.last_studied IS NULL THEN 1
          WHEN up.last_studied < datetime('now', '-7 days') THEN 2
          ELSE 3
        END as priority
      FROM words w
      JOIN topics t ON w.topic_id = t.id
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
      WHERE (up.learned != 1 OR up.learned IS NULL)
      ORDER BY 
        priority ASC,
        CASE 
          WHEN up.mastery_level > 0 AND up.mastery_level < 80 THEN 1
          WHEN up.last_studied IS NULL THEN 2
          ELSE 3
        END ASC,
        w.usage_frequency DESC,
        w.difficulty_level ASC
      LIMIT 50
    `, [userId]);

    const words = result.rows;
    const count = words.length;
    
    console.log(`✅ Найдено рекомендованных слов: ${count}`);
    
    res.json({
      success: true,
      words: words,
      count: count,
      message: `Найдено ${count} рекомендованных слов для изучения`
    });

  } catch (error) {
    console.error('❌ Ошибка при получении рекомендованных слов:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении рекомендованных слов: ' + (error.message || 'Неизвестная ошибка')
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Web App available at: http://localhost:${PORT}/webapp`);
});
