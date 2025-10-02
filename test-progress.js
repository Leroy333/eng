import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function testProgress() {
  const db = await open({
    filename: './engcard.db',
    driver: sqlite3.Database
  });
  
  try {
    // Проверяем, есть ли записи в user_progress
    const progressCount = await db.get('SELECT COUNT(*) as count FROM user_progress');
    console.log('📊 Записей в user_progress:', progressCount.count);
    
    // Проверяем структуру таблицы
    const tableInfo = await db.all('PRAGMA table_info(user_progress)');
    console.log('📋 Структура user_progress:', tableInfo);
    
    // Создаем тестовую запись прогресса
    await db.run(`
      INSERT OR IGNORE INTO user_progress 
      (user_id, word_id, topic_id, correct_attempts, incorrect_attempts, mastery_level, learned) 
      VALUES (1, 'word_1', 'animals', 0, 0, 0, 0)
    `);
    
    console.log('✅ Тестовая запись создана');
    
    // Проверяем прогресс
    const progress = await db.all(`
      SELECT 
        t.id as topic_id,
        t.name as topic_name,
        COUNT(w.id) as total_words,
        COUNT(CASE WHEN up.learned = 1 THEN 1 END) as learned_words,
        COUNT(CASE WHEN up.learned = 0 AND up.user_id IS NOT NULL THEN 1 END) as studying_words
      FROM topics t
      LEFT JOIN words w ON t.id = w.topic_id
      LEFT JOIN user_progress up ON w.id = up.word_id AND up.user_id = 1
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    
    console.log('📈 Прогресс тем:', progress);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await db.close();
  }
}

testProgress();
