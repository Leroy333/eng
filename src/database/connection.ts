import * as sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { QueryResult } from 'pg';

const dbPath = './engcard.db';

let db: Database | null = null;

// Инициализация подключения к SQLite
export const initDatabase = async (): Promise<void> => {
  if (!db) {
    const sqliteDriver: any = (sqlite3 as any).Database || (sqlite3 as any).default?.Database;
    if (!sqliteDriver) {
      throw new Error('SQLite driver not resolved from sqlite3 module');
    }
    db = await open({
      filename: dbPath,
      driver: sqliteDriver
    });
    console.log('✅ SQLite database connected');
  }
};

// Функция для выполнения запросов (адаптированная для SQLite)
export const query = async (text: string, params: any[] = []): Promise<QueryResult> => {
  if (!db) {
    await initDatabase();
  }

  const start = Date.now();
  try {
    // Заменяем PostgreSQL синтаксис на SQLite
    const sqliteText = text
      .replace(/\$(\d+)/g, '?') // Заменяем $1, $2 на ?, ?
      .replace(/SERIAL/g, 'INTEGER') // Заменяем SERIAL на INTEGER
      .replace(/BIGINT/g, 'INTEGER') // Заменяем BIGINT на INTEGER
      .replace(/BOOLEAN/g, 'INTEGER') // Заменяем BOOLEAN на INTEGER
      .replace(/TEXT\[\]/g, 'TEXT') // Заменяем TEXT[] на TEXT
      .replace(/JSONB/g, 'TEXT') // Заменяем JSONB на TEXT
      .replace(/CURRENT_TIMESTAMP/g, "datetime('now')") // Заменяем CURRENT_TIMESTAMP
      .replace(/ILIKE/g, 'LIKE') // Заменяем ILIKE на LIKE
      .replace(/to_tsvector\([^)]+\)/g, '1') // Убираем to_tsvector
      .replace(/gin\([^)]+\)/g, '1') // Убираем gin индексы
      .replace(/UNIQUE\([^)]+\)/g, 'UNIQUE') // Упрощаем UNIQUE
      .replace(/CHECK\s*\([^)]+\)/g, '') // Убираем CHECK constraints
      .replace(/CASCADE/g, '') // Убираем CASCADE
      .replace(/RETURNING\s+\*/g, '') // Убираем RETURNING
      .replace(/ON\s+DELETE\s+CASCADE/g, '') // Убираем ON DELETE CASCADE
      .replace(/ON\s+UPDATE\s+CASCADE/g, ''); // Убираем ON UPDATE CASCADE

    const result = await db!.all(sqliteText, params);
    const duration = Date.now() - start;
    
    console.log('Executed query', { text: sqliteText, duration, rows: result.length });
    
    return {
      rows: result,
      rowCount: result.length,
      command: 'SELECT'
    } as QueryResult;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Функция для получения одного результата
export const queryOne = async (text: string, params: any[] = []): Promise<any> => {
  if (!db) {
    await initDatabase();
  }

  const sqliteText = text
    .replace(/\$(\d+)/g, '?')
    .replace(/ILIKE/g, 'LIKE')
    .replace(/CURRENT_TIMESTAMP/g, "datetime('now')");

  const result = await db!.get(sqliteText, params);
  return result;
};

// Функция для выполнения запросов без возврата данных
export const exec = async (text: string): Promise<void> => {
  if (!db) {
    await initDatabase();
  }

  const sqliteText = text
    .replace(/SERIAL/g, 'INTEGER')
    .replace(/BIGINT/g, 'INTEGER')
    .replace(/BOOLEAN/g, 'INTEGER')
    .replace(/TEXT\[\]/g, 'TEXT')
    .replace(/JSONB/g, 'TEXT')
    .replace(/CURRENT_TIMESTAMP/g, "datetime('now')")
    .replace(/ILIKE/g, 'LIKE')
    .replace(/to_tsvector\([^)]+\)/g, '1')
    .replace(/gin\([^)]+\)/g, '1')
    .replace(/UNIQUE\([^)]+\)/g, 'UNIQUE')
    .replace(/CHECK\s*\([^)]+\)/g, '')
    .replace(/CASCADE/g, '')
    .replace(/RETURNING\s+\*/g, '')
    .replace(/ON\s+DELETE\s+CASCADE/g, '')
    .replace(/ON\s+UPDATE\s+CASCADE/g, '');

  await db!.exec(sqliteText);
};

// Функция для транзакций
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  if (!db) {
    await initDatabase();
  }

  try {
    await db!.exec('BEGIN');
    const result = await callback(db);
    await db!.exec('COMMIT');
    return result;
  } catch (error) {
    await db!.exec('ROLLBACK');
    throw error;
  }
};

// Функция для проверки подключения
export const testConnection = async (): Promise<boolean> => {
  try {
    await initDatabase();
    const result = await queryOne('SELECT datetime("now") as now');
    console.log('SQLite connection successful:', result);
    return true;
  } catch (error) {
    console.error('SQLite connection failed:', error);
    return false;
  }
};

// Функция для закрытия подключения
export const closePool = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
  }
};

// Функция для получения клиента (для совместимости с PostgreSQL кодом)
export const getClient = async (): Promise<any> => {
  if (!db) {
    await initDatabase();
  }
  return db;
};
