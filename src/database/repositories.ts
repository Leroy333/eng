import { query, transaction } from './connection.js';
import type {
  Topic,
  Word,
  User,
  UserProgress,
  StudySession,
  CreateUserData,
  CreateUserProgressData,
  CreateStudySessionData,
  UpdateUserProgressData,
  UpdateStudySessionData,
  UserStats,
  TopicStats,
  TopicProgress,
  WordProgress
} from './models';

// Репозиторий для работы с темами
export class TopicRepository {
  // Экземплярные методы для совместимости с server.mjs
  public async findAll(): Promise<Topic[]> { return TopicRepository.getAll(); }
  public async findById(id: string): Promise<Topic | null> { return TopicRepository.getById(id); }

  static async getAll(): Promise<Topic[]> {
    const result = await query(`
      SELECT 
        t.*,
        COALESCE(t.words_count, COUNT(w.id)) as words_count
      FROM topics t
      LEFT JOIN words w ON t.id = w.topic_id
      GROUP BY t.id, t.name, t.icon, t.emoji, t.description, t.color, t.created_at, t.updated_at
      ORDER BY t.name
    `);
    return result.rows;
  }

  static async getById(id: string): Promise<Topic | null> {
    const result = await query('SELECT * FROM topics WHERE id = ?', [id]);
    return result.rows[0] || null;
  }

  static async create(topic: Omit<Topic, 'created_at' | 'updated_at'>): Promise<Topic> {
    const result = await query(
      'INSERT INTO topics (id, name, icon, emoji, description, color, words_count) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [topic.id, topic.name, topic.icon, topic.emoji, topic.description || null, topic.color || null, topic.words_count || null]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Topic>): Promise<Topic | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.icon !== undefined) {
      fields.push(`icon = $${paramCount++}`);
      values.push(updates.icon);
    }
    if (updates.emoji !== undefined) {
      fields.push(`emoji = $${paramCount++}`);
      values.push(updates.emoji);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE topics SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM topics WHERE id = ?', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Импорт топика из Excel файла
  static async importFromExcel(topicData: any, wordsData: any[]): Promise<{ topic: Topic; wordsCount: number }> {
    return await transaction(async () => {
      // Создаем топик
      const topic = await TopicRepository.create({
        id: topicData.id,
        name: topicData.name,
        icon: topicData.icon,
        emoji: topicData.emoji,
        description: topicData.description,
        color: topicData.color,
        words_count: wordsData.length
      });

      // Создаем слова
      for (const wordData of wordsData) {
        await WordRepository.create({
          id: wordData.id,
          russian: wordData.russian,
          english: wordData.english,
          topic_id: wordData.topic_id,
          difficulty_level: wordData.difficulty_level || 1,
          pronunciation: wordData.pronunciation,
          example_sentence: wordData.example_sentence,
          usage_frequency: wordData.usage_frequency || 1
        });
      }

      return { topic, wordsCount: wordsData.length };
    });
  }

  // Статические прокси (если где-то вызываются статически)
  static async findAll(): Promise<Topic[]> { return this.getAll(); }
  static async findById(id: string): Promise<Topic | null> { return this.getById(id); }
}

// Репозиторий для работы со словами
export class WordRepository {
  // Экземплярные методы для совместимости с server.mjs
  public async findAll(): Promise<Word[]> { return WordRepository.getAll(); }
  public async findById(id: string): Promise<Word | null> { return WordRepository.getById(id); }
  public async findByTopic(topicId: string): Promise<Word[]> { return WordRepository.getByTopicId(topicId); }
  public async searchWords(searchTerm: string): Promise<Word[]> { return WordRepository.search(searchTerm); }

  static async getAll(): Promise<Word[]> {
    const result = await query('SELECT * FROM words ORDER BY russian');
    return result.rows;
  }

  static async getById(id: string): Promise<Word | null> {
    const result = await query('SELECT * FROM words WHERE id = ?', [id]);
    return result.rows[0] || null;
  }

  static async getByTopicId(topicId: string): Promise<Word[]> {
    const result = await query('SELECT * FROM words WHERE topic_id = ? ORDER BY difficulty_level, russian', [topicId]);
    return result.rows;
  }

  static async getByDifficulty(difficultyLevel: number): Promise<Word[]> {
    const result = await query('SELECT * FROM words WHERE difficulty_level = ? ORDER BY russian', [difficultyLevel]);
    return result.rows;
  }

  static async create(word: Omit<Word, 'created_at' | 'updated_at'>): Promise<Word> {
    const result = await query(
      'INSERT INTO words (id, russian, english, topic_id, difficulty_level, pronunciation, example_sentence, usage_frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [
        word.id, 
        word.russian, 
        word.english, 
        word.topic_id, 
        word.difficulty_level,
        word.pronunciation || null,
        word.example_sentence || null,
        word.usage_frequency || 1
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Word>): Promise<Word | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.russian !== undefined) {
      fields.push(`russian = $${paramCount++}`);
      values.push(updates.russian);
    }
    if (updates.english !== undefined) {
      fields.push(`english = $${paramCount++}`);
      values.push(updates.english);
    }
    if (updates.topic_id !== undefined) {
      fields.push(`topic_id = $${paramCount++}`);
      values.push(updates.topic_id);
    }
    if (updates.difficulty_level !== undefined) {
      fields.push(`difficulty_level = $${paramCount++}`);
      values.push(updates.difficulty_level);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE words SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM words WHERE id = ?', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async search(searchTerm: string): Promise<Word[]> {
    const result = await query(
      'SELECT * FROM words WHERE russian LIKE ? OR english LIKE ? ORDER BY russian',
      [`%${searchTerm}%`]
    );
    return result.rows;
  }

  // Статические прокси (если где-то вызываются статически)
  static async findAll(): Promise<Word[]> { return this.getAll(); }
  static async findById(id: string): Promise<Word | null> { return this.getById(id); }
  static async findByTopic(topicId: string): Promise<Word[]> { return this.getByTopicId(topicId); }
  static async searchWords(searchTerm: string): Promise<Word[]> { return this.search(searchTerm); }
}

// Репозиторий для работы с пользователями
export class UserRepository {
  // Экземплярные методы для совместимости с server.mjs
  public async findByTelegramId(telegramId: number): Promise<User | null> { return UserRepository.getByTelegramId(telegramId); }
  public async createUser(input: { telegramId: number; username?: string; firstName?: string; lastName?: string; languageCode?: string }): Promise<User> {
    const data: CreateUserData = {
      telegram_id: input.telegramId,
      username: input.username,
      first_name: input.firstName,
      last_name: input.lastName,
      language_code: input.languageCode ?? 'ru'
    };
    return UserRepository.create(data);
  }

  static async getAll(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async getById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = ?', [id]);
    return result.rows[0] || null;
  }

  static async getByTelegramId(telegramId: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserData): Promise<User> {
    const result = await query(
      'INSERT INTO users (telegram_id, username, first_name, last_name, language_code) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [userData.telegram_id, userData.username, userData.first_name, userData.last_name, userData.language_code || 'ru']
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }
    if (updates.first_name !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(updates.first_name);
    }
    if (updates.last_name !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(updates.last_name);
    }
    if (updates.language_code !== undefined) {
      fields.push(`language_code = $${paramCount++}`);
      values.push(updates.language_code);
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getOrCreateByTelegramId(telegramId: number, userData?: Partial<CreateUserData>): Promise<User> {
    let user = await this.getByTelegramId(telegramId);
    
    if (!user) {
      const createData: CreateUserData = {
        telegram_id: telegramId,
        ...userData
      };
      user = await this.create(createData);
    }
    
    return user;
  }

  // Статические прокси (если где-то вызываются статически)
  static async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.getByTelegramId(telegramId);
  }

  static async createUser(input: { telegramId: number; username?: string; firstName?: string; lastName?: string; languageCode?: string }): Promise<User> {
    const data: CreateUserData = {
      telegram_id: input.telegramId,
      username: input.username,
      first_name: input.firstName,
      last_name: input.lastName,
      language_code: input.languageCode ?? 'ru'
    };
    return this.create(data);
  }
}

// Репозиторий для работы с прогрессом пользователей
export class UserProgressRepository {
  // Экземплярные методы для совместимости с server.mjs
  public async findByUser(userId: number): Promise<UserProgress[]> { return UserProgressRepository.getByUserId(userId); }
  public async findByUserAndTopic(userId: number, topicId: string): Promise<UserProgress[]> { return UserProgressRepository.getByUserAndTopic(userId, topicId); }
  public async updateProgress(userId: number, wordId: string, _topicId: string, isCorrect: boolean): Promise<UserProgress> {
    return UserProgressRepository.recordAnswer(userId, wordId, isCorrect);
  }

  static async getByUserId(userId: number): Promise<UserProgress[]> {
    const result = await query('SELECT * FROM user_progress WHERE user_id = ? ORDER BY last_studied DESC', [userId]);
    return result.rows;
  }

  static async getByUserAndWord(userId: number, wordId: string): Promise<UserProgress | null> {
    const result = await query('SELECT * FROM user_progress WHERE user_id = ? AND word_id = ?', [userId, wordId]);
    return result.rows[0] || null;
  }

  static async getByUserAndTopic(userId: number, topicId: string): Promise<UserProgress[]> {
    const result = await query('SELECT * FROM user_progress WHERE user_id = ? AND topic_id = ? ORDER BY mastery_level DESC', [userId, topicId]);
    return result.rows;
  }

  static async create(progressData: CreateUserProgressData): Promise<UserProgress> {
    const result = await query(
      'INSERT INTO user_progress (user_id, word_id, topic_id, correct_attempts, incorrect_attempts, mastery_level, learned) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [
        progressData.user_id,
        progressData.word_id,
        progressData.topic_id,
        progressData.correct_attempts || 0,
        progressData.incorrect_attempts || 0,
        progressData.mastery_level || 0,
        progressData.learned ? 1 : 0
      ]
    );
    return result.rows[0];
  }

  static async update(userId: number, wordId: string, updates: UpdateUserProgressData): Promise<UserProgress | null> {
    const fields = [];
    const values = [];

    if (updates.correct_attempts !== undefined) {
      fields.push(`correct_attempts = ?`);
      values.push(updates.correct_attempts);
    }
    if (updates.incorrect_attempts !== undefined) {
      fields.push(`incorrect_attempts = ?`);
      values.push(updates.incorrect_attempts);
    }
    if (updates.mastery_level !== undefined) {
      fields.push(`mastery_level = ?`);
      values.push(updates.mastery_level);
    }
    if (updates.last_studied !== undefined) {
      fields.push(`last_studied = ?`);
      values.push(updates.last_studied);
    }
    if (updates.learned !== undefined) {
      fields.push(`learned = ?`);
      values.push(updates.learned ? 1 : 0);
    }

    if (fields.length === 0) return null;

    values.push(userId, wordId);
    const result = await query(
      `UPDATE user_progress SET ${fields.join(', ')} WHERE user_id = ? AND word_id = ?`,
      values
    );
    return result.rows[0] || null;
  }

  static async recordAnswer(userId: number, wordId: string, isCorrect: boolean): Promise<UserProgress> {
    return await transaction(async (client) => {
      // Получаем текущий прогресс
      const currentProgress = await client.query(
        'SELECT * FROM user_progress WHERE user_id = ? AND word_id = ?',
        [userId, wordId]
      );

      if (currentProgress.rows.length === 0) {
        // Создаем новую запись прогресса
        const word = await client.query('SELECT topic_id FROM words WHERE id = ?', [wordId]);
        if (word.rows.length === 0) {
          throw new Error('Word not found');
        }

        const newProgress = await client.query(
          'INSERT INTO user_progress (user_id, word_id, topic_id, correct_attempts, incorrect_attempts, mastery_level, last_studied) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
          [
            userId,
            wordId,
            word.rows[0].topic_id,
            isCorrect ? 1 : 0,
            isCorrect ? 0 : 1,
            isCorrect ? 10 : 0,
            new Date()
          ]
        );
        return newProgress.rows[0];
      } else {
        // Обновляем существующую запись
        const progress = currentProgress.rows[0];
        const newCorrectAttempts = isCorrect ? progress.correct_attempts + 1 : progress.correct_attempts;
        const newIncorrectAttempts = isCorrect ? progress.incorrect_attempts : progress.incorrect_attempts + 1;
        const totalAttempts = newCorrectAttempts + newIncorrectAttempts;
        const newMasteryLevel = Math.min(100, Math.round((newCorrectAttempts / totalAttempts) * 100));

        const updatedProgress = await client.query(
          'UPDATE user_progress SET correct_attempts = ?, incorrect_attempts = ?, mastery_level = ?, last_studied = ? WHERE user_id = ? AND word_id = ? RETURNING *',
          [newCorrectAttempts, newIncorrectAttempts, newMasteryLevel, new Date(), userId, wordId]
        );
        return updatedProgress.rows[0];
      }
    });
  }

  // Новые методы для прогресса
  static async markWordAsLearned(userId: number, wordId: string): Promise<UserProgress> {
    // Сначала пытаемся обновить существующую запись
    let result = await this.update(userId, wordId, { learned: true });
    
    // Если записи нет, создаём новую
    if (!result) {
      // Получаем topic_id для слова
      const wordResult = await query('SELECT topic_id FROM words WHERE id = ?', [wordId]);
      if (!wordResult.rows[0]) {
        throw new Error('Word not found');
      }
      const topicId = wordResult.rows[0].topic_id;
      
      // Создаём новую запись прогресса
      result = await this.create({
        user_id: userId,
        word_id: wordId,
        topic_id: topicId,
        learned: true,
        correct_attempts: 0,
        incorrect_attempts: 0,
        mastery_level: 0
      });
    }
    
    return result;
  }

  static async markWordAsStudying(userId: number, wordId: string): Promise<UserProgress> {
    // Сначала пытаемся обновить существующую запись
    let result = await this.update(userId, wordId, { learned: false });
    
    // Если записи нет, создаём новую
    if (!result) {
      // Получаем topic_id для слова
      const wordResult = await query('SELECT topic_id FROM words WHERE id = ?', [wordId]);
      if (!wordResult.rows[0]) {
        throw new Error('Word not found');
      }
      const topicId = wordResult.rows[0].topic_id;
      
      // Создаём новую запись прогресса
      result = await this.create({
        user_id: userId,
        word_id: wordId,
        topic_id: topicId,
        learned: false,
        correct_attempts: 0,
        incorrect_attempts: 0,
        mastery_level: 0
      });
    }
    
    return result;
  }

  static async getTopicProgress(userId: number, topicId: string): Promise<TopicProgress> {
    const result = await query(`
      SELECT 
        t.id as topic_id,
        t.name as topic_name,
        COUNT(w.id) as total_words,
        COUNT(CASE WHEN up.learned = 1 THEN 1 END) as learned_words,
        COUNT(CASE WHEN up.learned = 0 AND up.user_id IS NOT NULL THEN 1 END) as studying_words
      FROM topics t
      LEFT JOIN words w ON t.id = w.topic_id
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
      WHERE t.id = ?
      GROUP BY t.id, t.name
    `, [userId, topicId]);

    const stats = result.rows[0];
    const totalWords = parseInt(stats.total_words) || 0;
    const learnedWords = parseInt(stats.learned_words) || 0;
    const studyingWords = parseInt(stats.studying_words) || 0;
    const progressPercentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

    return {
      topic_id: stats.topic_id,
      topic_name: stats.topic_name,
      total_words: totalWords,
      learned_words: learnedWords,
      studying_words: studyingWords,
      progress_percentage: progressPercentage
    };
  }

  static async getAllTopicsProgress(userId: number): Promise<TopicProgress[]> {
    const result = await query(`
      SELECT 
        t.id as topic_id,
        t.name as topic_name,
        COUNT(w.id) as total_words,
        COUNT(CASE WHEN up.learned = 1 THEN 1 END) as learned_words,
        COUNT(CASE WHEN up.learned = 0 AND up.user_id IS NOT NULL THEN 1 END) as studying_words
      FROM topics t
      LEFT JOIN words w ON t.id = w.topic_id
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
      GROUP BY t.id, t.name
      ORDER BY t.name
    `, [userId]);

    return result.rows.map(stats => {
      const totalWords = parseInt(stats.total_words) || 0;
      const learnedWords = parseInt(stats.learned_words) || 0;
      const studyingWords = parseInt(stats.studying_words) || 0;
      const progressPercentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

      return {
        topic_id: stats.topic_id,
        topic_name: stats.topic_name,
        total_words: totalWords,
        learned_words: learnedWords,
        studying_words: studyingWords,
        progress_percentage: progressPercentage
      };
    });
  }

  static async getWordsProgress(userId: number, topicId: string): Promise<WordProgress[]> {
    const result = await query(`
      SELECT 
        w.id as word_id,
        COALESCE(up.learned, 0) as learned,
        CASE WHEN up.user_id IS NOT NULL AND up.learned = 0 THEN 1 ELSE 0 END as studying
      FROM words w
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
      WHERE w.topic_id = ?
      ORDER BY w.russian
    `, [userId, topicId]);

    return result.rows.map(row => ({
      word_id: row.word_id,
      learned: Boolean(row.learned),
      studying: Boolean(row.studying)
    }));
  }

  // Статические прокси (если где-то вызываются статически)
  static async findByUser(userId: number): Promise<UserProgress[]> { return this.getByUserId(userId); }
  static async findByUserAndTopic(userId: number, topicId: string): Promise<UserProgress[]> { return this.getByUserAndTopic(userId, topicId); }
  static async updateProgress(userId: number, wordId: string, _topicId: string, isCorrect: boolean): Promise<UserProgress> {
    return this.recordAnswer(userId, wordId, isCorrect);
  }
}

// Репозиторий для работы с сессиями изучения
export class StudySessionRepository {
  // Экземплярные методы для совместимости с server.mjs
  public async createSession(
    userId: number,
    topicId: string,
    data: { wordsStudied?: number; correctAnswers?: number; incorrectAnswers?: number; sessionDuration?: number }
  ): Promise<StudySession> {
    const sessionData: CreateStudySessionData = {
      user_id: userId,
      topic_id: topicId,
      words_studied: data.wordsStudied ?? 0,
      correct_answers: data.correctAnswers ?? 0,
      incorrect_answers: data.incorrectAnswers ?? 0,
      session_duration: data.sessionDuration ?? 0
    };
    return StudySessionRepository.create(sessionData);
  }

  public async findByUser(userId: number, limit: number = 10): Promise<StudySession[]> {
    return StudySessionRepository.getByUserId(userId, limit);
  }

  static async getByUserId(userId: number, limit: number = 10): Promise<StudySession[]> {
    const result = await query(
      'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?',
      [userId, limit]
    );
    return result.rows;
  }

  static async getByUserAndTopic(userId: number, topicId: string): Promise<StudySession[]> {
    const result = await query(
      'SELECT * FROM study_sessions WHERE user_id = ? AND topic_id = ? ORDER BY started_at DESC',
      [userId, topicId]
    );
    return result.rows;
  }

  static async create(sessionData: CreateStudySessionData): Promise<StudySession> {
    const result = await query(
      'INSERT INTO study_sessions (user_id, topic_id, words_studied, correct_answers, incorrect_answers, session_duration) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [
        sessionData.user_id,
        sessionData.topic_id,
        sessionData.words_studied || 0,
        sessionData.correct_answers || 0,
        sessionData.incorrect_answers || 0,
        sessionData.session_duration || 0
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: UpdateStudySessionData): Promise<StudySession | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.words_studied !== undefined) {
      fields.push(`words_studied = $${paramCount++}`);
      values.push(updates.words_studied);
    }
    if (updates.correct_answers !== undefined) {
      fields.push(`correct_answers = $${paramCount++}`);
      values.push(updates.correct_answers);
    }
    if (updates.incorrect_answers !== undefined) {
      fields.push(`incorrect_answers = $${paramCount++}`);
      values.push(updates.incorrect_answers);
    }
    if (updates.session_duration !== undefined) {
      fields.push(`session_duration = $${paramCount++}`);
      values.push(updates.session_duration);
    }
    if (updates.completed_at !== undefined) {
      fields.push(`completed_at = $${paramCount++}`);
      values.push(updates.completed_at);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE study_sessions SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async completeSession(id: number, duration: number): Promise<StudySession | null> {
    const result = await query(
      'UPDATE study_sessions SET completed_at = ?, session_duration = ? WHERE id = ? RETURNING *',
      [new Date(), duration, id]
    );
    return result.rows[0] || null;
  }

  // Статические прокси (если где-то вызываются статически)
  static async createSession(
    userId: number,
    topicId: string,
    data: { wordsStudied?: number; correctAnswers?: number; incorrectAnswers?: number; sessionDuration?: number }
  ): Promise<StudySession> {
    const sessionData: CreateStudySessionData = {
      user_id: userId,
      topic_id: topicId,
      words_studied: data.wordsStudied ?? 0,
      correct_answers: data.correctAnswers ?? 0,
      incorrect_answers: data.incorrectAnswers ?? 0,
      session_duration: data.sessionDuration ?? 0
    };
    return this.create(sessionData);
  }

  static async findByUser(userId: number, limit: number = 10): Promise<StudySession[]> {
    return this.getByUserId(userId, limit);
  }
}

// Репозиторий для получения статистики
export class StatsRepository {
  static async getUserStats(userId: number): Promise<UserStats> {
    const result = await query(`
      SELECT 
        COUNT(*) as total_words_studied,
        SUM(correct_attempts) as total_correct_answers,
        SUM(incorrect_attempts) as total_incorrect_answers,
        AVG(mastery_level) as average_mastery_level
      FROM user_progress 
      WHERE user_id = ?
    `, [userId]);

    const favoriteTopicsResult = await query(`
      SELECT 
        up.topic_id,
        t.name as topic_name,
        COUNT(*) as words_count
      FROM user_progress up
      JOIN topics t ON up.topic_id = t.id
      WHERE up.user_id = ?
      GROUP BY up.topic_id, t.name
      ORDER BY words_count DESC
      LIMIT 5
    `, [userId]);

    const stats = result.rows[0];
    return {
      total_words_studied: parseInt(stats.total_words_studied) || 0,
      total_correct_answers: parseInt(stats.total_correct_answers) || 0,
      total_incorrect_answers: parseInt(stats.total_incorrect_answers) || 0,
      average_mastery_level: parseFloat(stats.average_mastery_level) || 0,
      favorite_topics: favoriteTopicsResult.rows
    };
  }

  static async getTopicStats(topicId: string, userId?: number): Promise<TopicStats> {
    let queryText = `
      SELECT 
        t.id as topic_id,
        t.name as topic_name,
        COUNT(w.id) as total_words,
        AVG(w.difficulty_level) as average_difficulty
      FROM topics t
      LEFT JOIN words w ON t.id = w.topic_id
      WHERE t.id = ?
      GROUP BY t.id, t.name
    `;
    
    const params = [topicId];
    
    if (userId) {
      queryText = `
        SELECT 
          t.id as topic_id,
          t.name as topic_name,
          COUNT(w.id) as total_words,
          AVG(w.difficulty_level) as average_difficulty,
          COUNT(up.id) as words_studied,
          AVG(up.mastery_level) as mastery_percentage
        FROM topics t
        LEFT JOIN words w ON t.id = w.topic_id
        LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = ?
        WHERE t.id = ?
        GROUP BY t.id, t.name
      `;
      params.push(String(userId));
    }

    const result = await query(queryText, params);
    const stats = result.rows[0];
    
    return {
      topic_id: stats.topic_id,
      topic_name: stats.topic_name,
      total_words: parseInt(stats.total_words) || 0,
      words_studied: parseInt(stats.words_studied) || 0,
      average_difficulty: parseFloat(stats.average_difficulty) || 0,
      mastery_percentage: parseFloat(stats.mastery_percentage) || 0
    };
  }
}
