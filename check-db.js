import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function checkDatabase() {
  try {
    const db = await open({
      filename: './engcard.db',
      driver: sqlite3.Database
    });

    const topics = await db.all('SELECT id, name, words_count FROM topics ORDER BY words_count DESC');
    const total = await db.get('SELECT COUNT(*) as count FROM words');
    
    console.log('📊 Текущее состояние базы данных:');
    topics.forEach(topic => {
      console.log(`   - ${topic.name}: ${topic.words_count} слов`);
    });
    
    console.log(`\n📚 Всего слов в базе: ${total.count}`);
    
    await db.close();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

checkDatabase();
