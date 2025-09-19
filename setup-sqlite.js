// Простой скрипт для настройки SQLite базы данных (альтернатива PostgreSQL)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = './engcard.db';

async function setupDatabase() {
  console.log('🗄️ Настройка SQLite базы данных...\n');

  try {
    // Открываем базу данных
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ База данных SQLite создана');

    // Создаем таблицы
    await db.exec(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        emoji TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#007bff',
        words_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS words (
        id TEXT PRIMARY KEY,
        russian TEXT NOT NULL,
        english TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        difficulty_level INTEGER DEFAULT 1,
        pronunciation TEXT,
        example_sentence TEXT,
        usage_frequency INTEGER DEFAULT 1,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        language_code TEXT DEFAULT 'ru',
        is_active BOOLEAN DEFAULT 1,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        experience_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        word_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        correct_attempts INTEGER DEFAULT 0,
        incorrect_attempts INTEGER DEFAULT 0,
        last_studied DATETIME,
        mastery_level INTEGER DEFAULT 0,
        study_streak INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (word_id) REFERENCES words(id),
        FOREIGN KEY (topic_id) REFERENCES topics(id),
        UNIQUE(user_id, word_id)
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        topic_id TEXT NOT NULL,
        words_studied INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        incorrect_answers INTEGER DEFAULT 0,
        session_duration INTEGER DEFAULT 0,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (topic_id) REFERENCES topics(id)
      );
    `);

    console.log('✅ Таблицы созданы');

    // Вставляем тестовые данные
    await db.exec(`
      INSERT OR IGNORE INTO topics (id, name, icon, emoji, description, color, words_count) VALUES
      ('music', 'music', '🎧', '🎵', 'Музыкальная тематика', '#28a745', 5),
      ('cinema', 'cinema', '🎬', '🎭', 'Кинематограф', '#17a2b8', 5),
      ('travel', 'travel', '🚂', '✈️', 'Путешествия', '#ffc107', 5),
      ('animals', 'animals', '🐕', '🐾', 'Животные', '#fd7e14', 5),
      ('hobby', 'hobby', '🎮', '🎯', 'Хобби', '#6f42c1', 5),
      ('weather', 'weather', '☁️', '🌤️', 'Погода', '#20c997', 5);

      INSERT OR IGNORE INTO words (id, russian, english, topic_id, difficulty_level, pronunciation, example_sentence) VALUES
      ('music-1', 'музыка', 'music', 'music', 1, '[ˈmjuːzɪk]', 'I love listening to music.'),
      ('music-2', 'песня', 'song', 'music', 1, '[sɒŋ]', 'This is my favorite song.'),
      ('music-3', 'гитара', 'guitar', 'music', 2, '[ɡɪˈtɑːr]', 'He plays the guitar beautifully.'),
      ('music-4', 'пианино', 'piano', 'music', 2, '[piˈænoʊ]', 'She is learning to play the piano.'),
      ('music-5', 'барабан', 'drum', 'music', 2, '[drʌm]', 'The drums sound amazing.'),

      ('cinema-1', 'кино', 'cinema', 'cinema', 1, '[ˈsɪnəmə]', 'Let''s go to the cinema.'),
      ('cinema-2', 'фильм', 'movie', 'cinema', 1, '[ˈmuːvi]', 'This movie is fantastic.'),
      ('cinema-3', 'актер', 'actor', 'cinema', 2, '[ˈæktər]', 'He is a famous actor.'),
      ('cinema-4', 'режиссер', 'director', 'cinema', 3, '[dɪˈrektər]', 'The director won an Oscar.'),
      ('cinema-5', 'сценарий', 'script', 'cinema', 3, '[skrɪpt]', 'The script is well-written.'),

      ('travel-1', 'путешествие', 'travel', 'travel', 2, '[ˈtrævəl]', 'I love to travel around the world.'),
      ('travel-2', 'самолет', 'airplane', 'travel', 2, '[ˈeərpleɪn]', 'The airplane is ready for takeoff.'),
      ('travel-3', 'поезд', 'train', 'travel', 1, '[treɪn]', 'The train arrives at 3 PM.'),
      ('travel-4', 'отель', 'hotel', 'travel', 2, '[hoʊˈtel]', 'We stayed at a luxury hotel.'),
      ('travel-5', 'паспорт', 'passport', 'travel', 3, '[ˈpæspɔːrt]', 'Don''t forget your passport.'),

      ('animals-1', 'животное', 'animal', 'animals', 1, '[ˈænɪməl]', 'Dogs are loyal animals.'),
      ('animals-2', 'собака', 'dog', 'animals', 1, '[dɔːɡ]', 'My dog is very friendly.'),
      ('animals-3', 'кошка', 'cat', 'animals', 1, '[kæt]', 'The cat is sleeping on the sofa.'),
      ('animals-4', 'птица', 'bird', 'animals', 1, '[bɜːrd]', 'Birds can fly high in the sky.'),
      ('animals-5', 'рыба', 'fish', 'animals', 1, '[fɪʃ]', 'Fish live in water.'),

      ('hobby-1', 'хобби', 'hobby', 'hobby', 1, '[ˈhɑːbi]', 'Reading is my favorite hobby.'),
      ('hobby-2', 'чтение', 'reading', 'hobby', 2, '[ˈriːdɪŋ]', 'Reading books is very relaxing.'),
      ('hobby-3', 'рисование', 'drawing', 'hobby', 2, '[ˈdrɔːɪŋ]', 'Drawing helps me express creativity.'),
      ('hobby-4', 'спорт', 'sport', 'hobby', 1, '[spɔːrt]', 'Sport is good for health.'),
      ('hobby-5', 'игра', 'game', 'hobby', 1, '[ɡeɪm]', 'Let''s play a game together.'),

      ('weather-1', 'погода', 'weather', 'weather', 1, '[ˈweðər]', 'The weather is nice today.'),
      ('weather-2', 'солнце', 'sun', 'weather', 1, '[sʌn]', 'The sun is shining brightly.'),
      ('weather-3', 'дождь', 'rain', 'weather', 1, '[reɪn]', 'It''s raining outside.'),
      ('weather-4', 'снег', 'snow', 'weather', 1, '[snoʊ]', 'Snow is falling from the sky.'),
      ('weather-5', 'облако', 'cloud', 'weather', 1, '[klaʊd]', 'Clouds are white and fluffy.');
    `);

    console.log('✅ Тестовые данные добавлены');

    // Проверяем данные
    const topics = await db.all('SELECT * FROM topics');
    const words = await db.all('SELECT * FROM words');
    
    console.log(`📊 Статистика:`);
    console.log(`   - Тем: ${topics.length}`);
    console.log(`   - Слов: ${words.length}`);

    await db.close();
    console.log('\n🎉 База данных SQLite готова к использованию!');
    console.log(`📁 Файл базы данных: ${dbPath}`);

  } catch (error) {
    console.error('❌ Ошибка при настройке базы данных:', error.message);
  }
}

setupDatabase();


