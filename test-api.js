// Простой скрипт для тестирования API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Тестирование API EngCard...\n');

  try {
    // Тест 1: Проверка здоровья сервера
    console.log('1. Проверка здоровья сервера...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Сервер работает:', healthData.status);
    console.log('');

    // Тест 2: Загрузка тем
    console.log('2. Загрузка тем...');
    const topicsResponse = await fetch(`${API_BASE}/api/topics`);
    const topics = await topicsResponse.json();
    console.log(`✅ Загружено тем: ${topics.length}`);
    topics.forEach(topic => {
      console.log(`   - ${topic.name} (${topic.words_count || 0} слов)`);
    });
    console.log('');

    // Тест 3: Загрузка всех слов
    console.log('3. Загрузка всех слов...');
    const wordsResponse = await fetch(`${API_BASE}/api/words`);
    const words = await wordsResponse.json();
    console.log(`✅ Загружено слов: ${words.length}`);
    console.log('');

    // Тест 4: Загрузка слов по теме
    if (topics.length > 0) {
      const firstTopic = topics[0];
      console.log(`4. Загрузка слов по теме "${firstTopic.name}"...`);
      const topicWordsResponse = await fetch(`${API_BASE}/api/words/topic/${firstTopic.id}`);
      const topicWords = await topicWordsResponse.json();
      console.log(`✅ Загружено слов для темы "${firstTopic.name}": ${topicWords.length}`);
      topicWords.slice(0, 3).forEach(word => {
        console.log(`   - ${word.russian} → ${word.english}`);
      });
      console.log('');
    }

    // Тест 5: Создание тестового пользователя
    console.log('5. Создание тестового пользователя...');
    const userResponse = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegramId: 999888777,
        username: 'test_user',
        firstName: 'Тест',
        lastName: 'Пользователь'
      })
    });
    const user = await userResponse.json();
    console.log(`✅ Пользователь создан: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    console.log('');

    console.log('🎉 Все тесты прошли успешно!');
    console.log('💡 Теперь вы можете запустить приложение и проверить работу с базой данных.');

  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error.message);
    console.log('');
    console.log('🔧 Возможные решения:');
    console.log('1. Убедитесь, что сервер запущен: npm run server');
    console.log('2. Проверьте, что база данных создана и заполнена данными');
    console.log('3. Проверьте настройки в .env файле');
  }
}

// Запуск тестов
testAPI();
