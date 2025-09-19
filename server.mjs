import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Импорт модулей для работы с базой данных
import { testConnection } from './dist/database/connection.js';
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Web App available at: http://localhost:${PORT}/webapp`);
});
