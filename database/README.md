# Создание базы данных EngCard

Этот документ содержит инструкции по созданию базы данных для приложения EngCard.

## 📋 Доступные скрипты

### 1. **`create_basic_tables.sql`** - Базовая структура (рекомендуется)
- **5 основных таблиц**: users, topics, words, user_progress, study_sessions
- **Базовые индексы** для производительности
- **Тестовые данные**: 6 тем, 25 слов, 3 пользователя
- **Быстрый старт** для разработки

### 2. **`create_complete_database.sql`** - Полная структура
- **15+ таблиц** с расширенной функциональностью
- **Достижения, настройки, теги, уведомления**
- **Полная система геймификации**
- **Подробная аналитика**

## 🚀 Быстрый старт

### Вариант 1: Базовая структура (рекомендуется)

```bash
# Подключение к PostgreSQL
psql -U postgres -d engcard_db

# Выполнение скрипта
\i database/create_basic_tables.sql
```

### Вариант 2: Полная структура

```bash
# Подключение к PostgreSQL
psql -U postgres -d engcard_db

# Выполнение скрипта
\i database/create_complete_database.sql
```

## 📊 Структура базы данных

### Основные таблицы:

#### **users** - Пользователи
- `id` - Уникальный идентификатор
- `telegram_id` - ID в Telegram
- `username`, `first_name`, `last_name` - Данные пользователя
- `language_code` - Язык интерфейса
- `total_points` - Общие очки
- `level` - Уровень пользователя
- `experience_points` - Очки опыта

#### **topics** - Темы изучения
- `id` - Уникальный идентификатор темы
- `name` - Название темы
- `icon`, `emoji` - Иконки для UI
- `description` - Описание темы
- `color` - Цвет темы
- `words_count` - Количество слов в теме

#### **words** - Слова для изучения
- `id` - Уникальный идентификатор слова
- `russian` - Русский перевод
- `english` - Английское слово
- `topic_id` - Ссылка на тему
- `difficulty_level` - Уровень сложности (1-5)
- `pronunciation` - Транскрипция
- `example_sentence` - Пример предложения
- `usage_frequency` - Частота использования (1-5)
- `views_count`, `likes_count` - Статистика

#### **user_progress** - Прогресс изучения
- `user_id` - Ссылка на пользователя
- `word_id` - Ссылка на слово
- `topic_id` - Ссылка на тему
- `correct_attempts` - Правильные ответы
- `incorrect_attempts` - Неправильные ответы
- `mastery_level` - Уровень освоения (0-100%)
- `study_streak` - Серия правильных ответов
- `last_studied` - Время последнего изучения

#### **study_sessions** - Сессии изучения
- `user_id` - Ссылка на пользователя
- `topic_id` - Ссылка на тему
- `words_studied` - Количество изученных слов
- `correct_answers` - Правильные ответы
- `incorrect_answers` - Неправильные ответы
- `session_duration` - Длительность сессии
- `started_at`, `completed_at` - Время начала и завершения

## 🔗 Связи между таблицами

- `words.topic_id` → `topics.id` (многие к одному)
- `user_progress.user_id` → `users.id` (многие к одному)
- `user_progress.word_id` → `words.id` (многие к одному)
- `user_progress.topic_id` → `topics.id` (многие к одному)
- `study_sessions.user_id` → `users.id` (многие к одному)
- `study_sessions.topic_id` → `topics.id` (многие к одному)

## 📈 Тестовые данные

### Темы (6 штук):
- **music** - Музыка (🎧)
- **cinema** - Кино (🎬)
- **travel** - Путешествия (🚂)
- **animals** - Животные (🐕)
- **hobby** - Хобби (🎮)
- **weather** - Погода (☁️)

### Слова (25 штук):
- По 5 слов в каждой теме
- Разные уровни сложности (1-3)
- Транскрипция и примеры предложений
- Настроенная частота использования

### Пользователи (3 штуки):
- Тестовые пользователи с разными уровнями
- Настроенные очки и опыт

## 🛠️ Команды для работы

### Проверка структуры:
```sql
-- Список всех таблиц
\dt

-- Описание таблицы
\d users

-- Количество записей в таблицах
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'topics', COUNT(*) FROM topics
UNION ALL
SELECT 'words', COUNT(*) FROM words
UNION ALL
SELECT 'user_progress', COUNT(*) FROM user_progress
UNION ALL
SELECT 'study_sessions', COUNT(*) FROM study_sessions;
```

### Проверка связей:
```sql
-- Слова по темам
SELECT t.name as topic, COUNT(w.id) as words_count
FROM topics t
LEFT JOIN words w ON t.id = w.topic_id
GROUP BY t.id, t.name
ORDER BY words_count DESC;

-- Прогресс пользователей
SELECT u.first_name, COUNT(up.word_id) as words_studied
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id, u.first_name;
```

### Добавление новых данных:
```sql
-- Добавление нового пользователя
INSERT INTO users (telegram_id, username, first_name, last_name) 
VALUES (999888777, 'new_user', 'Новый', 'Пользователь');

-- Добавление нового слова
INSERT INTO words (id, russian, english, topic_id, difficulty_level) 
VALUES ('new-word-1', 'новое слово', 'new word', 'music', 2);

-- Запись прогресса
INSERT INTO user_progress (user_id, word_id, topic_id, correct_attempts, mastery_level) 
VALUES (1, 'music-1', 'music', 1, 20);
```

## ⚠️ Важные замечания

### 1. **Порядок выполнения**
- Сначала создайте базу данных: `CREATE DATABASE engcard_db;`
- Затем выполните один из скриптов
- Не смешивайте базовый и полный скрипты

### 2. **Безопасность**
- Скрипты безопасны для повторного запуска
- Используют `DROP TABLE IF EXISTS` для очистки
- Не удаляют данные при повторном выполнении

### 3. **Производительность**
- Созданы индексы для всех внешних ключей
- Оптимизированы запросы для частых операций
- Настроены ограничения целостности

## 🐛 Устранение неполадок

### Ошибка "database does not exist"
```sql
CREATE DATABASE engcard_db;
```

### Ошибка "permission denied"
```sql
-- Подключитесь как суперпользователь
psql -U postgres
```

### Ошибка "table already exists"
Это нормально при повторном запуске скрипта.

### Ошибка "constraint already exists"
Ограничения уже созданы, можно игнорировать.

## 📊 Мониторинг

### Проверка целостности данных:
```sql
-- Проверка связей
SELECT 
    'Связи' as check_type,
    COUNT(*) as count
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';

-- Проверка индексов
SELECT 
    'Индексы' as check_type,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Статистика использования:
```sql
-- Популярные слова
SELECT w.russian, w.english, w.views_count, w.likes_count
FROM words w
ORDER BY (w.views_count + w.likes_count) DESC
LIMIT 10;

-- Активные пользователи
SELECT u.first_name, u.total_points, u.level
FROM users u
ORDER BY u.total_points DESC;
```

## 🎯 Следующие шаги

1. **Выберите скрипт** (базовый или полный)
2. **Выполните в psql** команды из раздела "Быстрый старт"
3. **Проверьте результат** командами из раздела "Команды для работы"
4. **Настройте приложение** для работы с базой данных
5. **Добавьте свои данные** при необходимости

## 📚 Дополнительная информация

- [Документация PostgreSQL](https://www.postgresql.org/docs/)
- [Node.js pg модуль](https://node-postgres.com/)
- [SQL Tutorial](https://www.w3schools.com/sql/)

---

**Готово!** 🎉 Ваша база данных EngCard создана и готова к использованию!
