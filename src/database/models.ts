// Интерфейсы для работы с базой данных

export interface Topic {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Word {
  id: string;
  russian: string;
  english: string;
  topic_id: string;
  difficulty_level: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserProgress {
  id: number;
  user_id: number;
  word_id: string;
  topic_id: string;
  correct_attempts: number;
  incorrect_attempts: number;
  last_studied?: Date;
  mastery_level: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface StudySession {
  id: number;
  user_id: number;
  topic_id: string;
  words_studied: number;
  correct_answers: number;
  incorrect_answers: number;
  session_duration: number;
  started_at: Date;
  completed_at?: Date;
}

// Интерфейсы для создания новых записей
export interface CreateUserData {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export interface CreateUserProgressData {
  user_id: number;
  word_id: string;
  topic_id: string;
  correct_attempts?: number;
  incorrect_attempts?: number;
  mastery_level?: number;
}

export interface CreateStudySessionData {
  user_id: number;
  topic_id: string;
  words_studied?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  session_duration?: number;
}

// Интерфейсы для обновления записей
export interface UpdateUserProgressData {
  correct_attempts?: number;
  incorrect_attempts?: number;
  mastery_level?: number;
  last_studied?: Date;
}

export interface UpdateStudySessionData {
  words_studied?: number;
  correct_answers?: number;
  incorrect_answers?: number;
  session_duration?: number;
  completed_at?: Date;
}

// Интерфейсы для статистики
export interface UserStats {
  total_words_studied: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  average_mastery_level: number;
  favorite_topics: Array<{
    topic_id: string;
    topic_name: string;
    words_count: number;
  }>;
}

export interface TopicStats {
  topic_id: string;
  topic_name: string;
  total_words: number;
  words_studied: number;
  average_difficulty: number;
  mastery_percentage: number;
}
