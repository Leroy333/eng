// Экспорт всех модулей базы данных
export * from './connection';
export * from './models';
export * from './repositories';

// Удобные функции для быстрого доступа
export { 
  testConnection, 
  closePool, 
  query, 
  transaction 
} from './connection';

export {
  TopicRepository,
  WordRepository,
  UserRepository,
  UserProgressRepository,
  StudySessionRepository,
  StatsRepository
} from './repositories';

export type {
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
