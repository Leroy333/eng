# 🚀 Интеграция с базой данных - Руководство

Это руководство поможет вам интегрировать приложение EngCard с базой данных PostgreSQL.

## 📋 Что было сделано

### 1. **Обновлены Stores (Effector)**
- **`src/store/topics.ts`** - теперь загружает темы из API
- **`src/store/words.ts`** - теперь загружает слова из API
- Добавлены эффекты для загрузки данных
- Добавлена обработка ошибок с fallback данными

### 2. **Обновлены компоненты**
- **`DashboardScreen`** - показывает количество слов в каждой теме
- **`WordCardScreen`** - отображает транскрипцию и примеры предложений
- Добавлен компонент **`LoadingSpinner`** для индикации загрузки

### 3. **Создан тестовый скрипт**
- **`test-api.js`** - для проверки работы API

## 🛠️ Пошаговая инструкция

### Шаг 1: Создание базы данных

```bash
# 1. Подключение к PostgreSQL
psql -U postgres

# 2. Создание базы данных
CREATE DATABASE engcard_db;

# 3. Выход из psql
\q

# 4. Выполнение скрипта создания таблиц
psql -U postgres -d engcard_db -f database/create_complete_database.sql
```

### Шаг 2: Настройка окружения

Создайте файл `.env` в корне проекта:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=engcard_db
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/engcard_db

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Шаг 3: Запуск сервера

```bash
# Запуск сервера с API
npm run server
```

Сервер будет доступен по адресу: `http://localhost:3001`

### Шаг 4: Тестирование API

```bash
# Запуск тестового скрипта
node test-api.js
```

Ожидаемый результат:
```
🧪 Тестирование API EngCard...

1. Проверка здоровья сервера...
✅ Сервер работает: OK

2. Загрузка тем...
✅ Загружено тем: 6
   - music (5 слов)
   - cinema (5 слов)
   - travel (5 слов)
   - animals (5 слов)
   - hobby (5 слов)
   - weather (5 слов)

3. Загрузка всех слов...
✅ Загружено слов: 25

4. Загрузка слов по теме "music"...
✅ Загружено слов для темы "music": 5
   - музыка → music
   - песня → song
   - гитара → guitar

5. Создание тестового пользователя...
✅ Пользователь создан: Тест Пользователь (ID: 1)

🎉 Все тесты прошли успешно!
```

### Шаг 5: Запуск приложения

```bash
# В новом терминале
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:5173`

## 🎯 Что вы увидите

### Dashboard (Главная страница)
- **Темы с количеством слов** - каждая тема показывает количество доступных слов
- **Индикатор загрузки** - при загрузке данных из API
- **Fallback данные** - если API недоступен, показываются локальные данные

### Word Cards (Карточки слов)
- **Транскрипция** - отображается на лицевой стороне карточки
- **Примеры предложений** - показываются на обратной стороне
- **Индикатор загрузки** - при загрузке слов по теме

## 🔧 API Endpoints

### Темы
- `GET /api/topics` - получить все темы
- `GET /api/topics/:id` - получить тему по ID

### Слова
- `GET /api/words` - получить все слова
- `GET /api/words/topic/:topicId` - получить слова по теме
- `GET /api/words/:id` - получить слово по ID

### Пользователи
- `GET /api/users` - получить всех пользователей
- `POST /api/users` - создать пользователя
- `GET /api/users/:id` - получить пользователя по ID

### Прогресс
- `GET /api/progress/user/:userId` - получить прогресс пользователя
- `POST /api/progress` - создать/обновить прогресс

### Сессии
- `GET /api/sessions/user/:userId` - получить сессии пользователя
- `POST /api/sessions` - создать сессию

## 🐛 Устранение неполадок

### Ошибка "Failed to load topics"
```bash
# Проверьте, что сервер запущен
curl http://localhost:3001/health

# Проверьте подключение к базе данных
psql -U postgres -d engcard_db -c "SELECT COUNT(*) FROM topics;"
```

### Ошибка "Database connection failed"
```bash
# Проверьте настройки в .env
cat .env

# Проверьте, что PostgreSQL запущен
pg_ctl status

# Проверьте, что база данных существует
psql -U postgres -l | grep engcard_db
```

### Ошибка "CORS policy"
```bash
# Убедитесь, что CORS_ORIGIN настроен правильно
echo $CORS_ORIGIN

# Проверьте, что приложение запущено на правильном порту
npm run dev
```

## 📊 Структура данных

### Темы (topics)
```json
{
  "id": "music",
  "name": "music",
  "icon": "🎧",
  "emoji": "🎵",
  "description": "Музыкальная тематика",
  "color": "#28a745",
  "words_count": 5
}
```

### Слова (words)
```json
{
  "id": "music-1",
  "russian": "музыка",
  "english": "music",
  "topic_id": "music",
  "difficulty_level": 1,
  "pronunciation": "[ˈmjuːzɪk]",
  "example_sentence": "I love listening to music.",
  "usage_frequency": 5
}
```

## 🚀 Следующие шаги

1. **Добавьте аутентификацию** - для работы с пользователями
2. **Реализуйте прогресс** - сохранение изученных слов
3. **Добавьте статистику** - аналитика изучения
4. **Создайте админ-панель** - для управления контентом
5. **Добавьте тесты** - для проверки функциональности

## 📚 Полезные команды

```bash
# Проверка статуса базы данных
psql -U postgres -d engcard_db -c "SELECT 'База данных работает!' as status;"

# Просмотр всех таблиц
psql -U postgres -d engcard_db -c "\dt"

# Подсчет записей в таблицах
psql -U postgres -d engcard_db -c "
SELECT 'topics' as table_name, COUNT(*) as count FROM topics
UNION ALL
SELECT 'words', COUNT(*) FROM words
UNION ALL
SELECT 'users', COUNT(*) FROM users;"

# Очистка базы данных (осторожно!)
psql -U postgres -d engcard_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

---

**Готово!** 🎉 Ваше приложение теперь интегрировано с базой данных PostgreSQL и готово к использованию!
