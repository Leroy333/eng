import { query, transaction } from './connection';
import {
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
  TopicStats
} from './models';

// Репозиторий для работы с темами
export class TopicRepository {
  static async getAll(): Promise<Topic[]> {
    const result = await query('SELECT * FROM topics ORDER BY name');
    return result.rows;
  }

  static async getById(id: string): Promise<Topic | null> {
    const result = await query('SELECT * FROM topics WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(topic: Omit<Topic, 'created_at' | 'updated_at'>): Promise<Topic> {
    const result = await query(
      'INSERT INTO topics (id, name, icon, emoji) VALUES ($1, $2, $3, $4) RETURNING *',
      [topic.id, topic.name, topic.icon, topic.emoji]
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
    const result = await query('DELETE FROM topics WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

// Репозиторий для работы со словами
export class WordRepository {
  static async getAll(): Promise<Word[]> {
    const result = await query('SELECT * FROM words ORDER BY russian');
    return result.rows;
  }

  static async getById(id: string): Promise<Word | null> {
    const result = await query('SELECT * FROM words WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByTopicId(topicId: string): Promise<Word[]> {
    const result = await query('SELECT * FROM words WHERE topic_id = $1 ORDER BY difficulty_level, russian', [topicId]);
    return result.rows;
  }

  static async getByDifficulty(difficultyLevel: number): Promise<Word[]> {
    const result = await query('SELECT * FROM words WHERE difficulty_level = $1 ORDER BY russian', [difficultyLevel]);
    return result.rows;
  }

  static async create(word: Omit<Word, 'created_at' | 'updated_at'>): Promise<Word> {
    const result = await query(
      'INSERT INTO words (id, russian, english, topic_id, difficulty_level) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [word.id, word.russian, word.english, word.topic_id, word.difficulty_level]
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
    const result = await query('DELETE FROM words WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  static async search(searchTerm: string): Promise<Word[]> {
    const result = await query(
      'SELECT * FROM words WHERE russian ILIKE $1 OR english ILIKE $1 ORDER BY russian',
      [`%${searchTerm}%`]
    );
    return result.rows;
  }
}

// Репозиторий для работы с пользователями
export class UserRepository {
  static async getAll(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  static async getById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByTelegramId(telegramId: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserData): Promise<User> {
    const result = await query(
      'INSERT INTO users (telegram_id, username, first_name, last_name, language_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
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
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
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
}

// Репозиторий для работы с прогрессом пользователей
export class UserProgressRepository {
  static async getByUserId(userId: number): Promise<UserProgress[]> {
    const result = await query('SELECT * FROM user_progress WHERE user_id = $1 ORDER BY last_studied DESC', [userId]);
    return result.rows;
  }

  static async getByUserAndWord(userId: number, wordId: string): Promise<UserProgress | null> {
    const result = await query('SELECT * FROM user_progress WHERE user_id = $1 AND word_id = $2', [userId, wordId]);
    return result.rows[0] || null;
  }

  static async getByUserAndTopic(userId: number, topicId: string): Promise<UserProgress[]> {
    const result = await query('SELECT * FROM user_progress WHERE user_id = $1 AND topic_id = $2 ORDER BY mastery_level DESC', [userId, topicId]);
    return result.rows;
  }

  static async create(progressData: CreateUserProgressData): Promise<UserProgress> {
    const result = await query(
      'INSERT INTO user_progress (user_id, word_id, topic_id, correct_attempts, incorrect_attempts, mastery_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        progressData.user_id,
        progressData.word_id,
        progressData.topic_id,
        progressData.correct_attempts || 0,
        progressData.incorrect_attempts || 0,
        progressData.mastery_level || 0
      ]
    );
    return result.rows[0];
  }

  static async update(userId: number, wordId: string, updates: UpdateUserProgressData): Promise<UserProgress | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.correct_attempts !== undefined) {
      fields.push(`correct_attempts = $${paramCount++}`);
      values.push(updates.correct_attempts);
    }
    if (updates.incorrect_attempts !== undefined) {
      fields.push(`incorrect_attempts = $${paramCount++}`);
      values.push(updates.incorrect_attempts);
    }
    if (updates.mastery_level !== undefined) {
      fields.push(`mastery_level = $${paramCount++}`);
      values.push(updates.mastery_level);
    }
    if (updates.last_studied !== undefined) {
      fields.push(`last_studied = $${paramCount++}`);
      values.push(updates.last_studied);
    }

    if (fields.length === 0) return null;

    values.push(userId, wordId);
    const result = await query(
      `UPDATE user_progress SET ${fields.join(', ')} WHERE user_id = $${paramCount} AND word_id = $${paramCount + 1} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async recordAnswer(userId: number, wordId: string, isCorrect: boolean): Promise<UserProgress> {
    return await transaction(async (client) => {
      // Получаем текущий прогресс
      const currentProgress = await client.query(
        'SELECT * FROM user_progress WHERE user_id = $1 AND word_id = $2',
        [userId, wordId]
      );

      if (currentProgress.rows.length === 0) {
        // Создаем новую запись прогресса
        const word = await client.query('SELECT topic_id FROM words WHERE id = $1', [wordId]);
        if (word.rows.length === 0) {
          throw new Error('Word not found');
        }

        const newProgress = await client.query(
          'INSERT INTO user_progress (user_id, word_id, topic_id, correct_attempts, incorrect_attempts, mastery_level, last_studied) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
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
          'UPDATE user_progress SET correct_attempts = $1, incorrect_attempts = $2, mastery_level = $3, last_studied = $4 WHERE user_id = $5 AND word_id = $6 RETURNING *',
          [newCorrectAttempts, newIncorrectAttempts, newMasteryLevel, new Date(), userId, wordId]
        );
        return updatedProgress.rows[0];
      }
    });
  }
}

// Репозиторий для работы с сессиями изучения
export class StudySessionRepository {
  static async getByUserId(userId: number, limit: number = 10): Promise<StudySession[]> {
    const result = await query(
      'SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async getByUserAndTopic(userId: number, topicId: string): Promise<StudySession[]> {
    const result = await query(
      'SELECT * FROM study_sessions WHERE user_id = $1 AND topic_id = $2 ORDER BY started_at DESC',
      [userId, topicId]
    );
    return result.rows;
  }

  static async create(sessionData: CreateStudySessionData): Promise<StudySession> {
    const result = await query(
      'INSERT INTO study_sessions (user_id, topic_id, words_studied, correct_answers, incorrect_answers, session_duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
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
      'UPDATE study_sessions SET completed_at = $1, session_duration = $2 WHERE id = $3 RETURNING *',
      [new Date(), duration, id]
    );
    return result.rows[0] || null;
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
      WHERE user_id = $1
    `, [userId]);

    const favoriteTopicsResult = await query(`
      SELECT 
        up.topic_id,
        t.name as topic_name,
        COUNT(*) as words_count
      FROM user_progress up
      JOIN topics t ON up.topic_id = t.id
      WHERE up.user_id = $1
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
      WHERE t.id = $1
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
        LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = $2
        WHERE t.id = $1
        GROUP BY t.id, t.name
      `;
      params.push(userId);
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
