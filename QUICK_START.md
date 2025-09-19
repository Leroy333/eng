# 🚀 Быстрый старт - EngCard с базой данных

## 📋 Что нужно сделать

### 1. Создать базу данных
```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE engcard_db;
\q

# Создание таблиц и заполнение данными
psql -U postgres -d engcard_db -f database/create_complete_database.sql
```

### 2. Настроить окружение
Создайте файл `.env` в корне проекта:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=engcard_db
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/engcard_db
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Запустить сервер
```bash
npm run server
```

### 4. Протестировать API
```bash
node test-api.js
```

### 5. Запустить приложение
```bash
npm run dev
```

## 🎯 Результат

- **Dashboard** показывает темы с количеством слов из базы данных
- **Word Cards** отображают транскрипцию и примеры предложений
- **Индикаторы загрузки** при работе с API
- **Fallback данные** если API недоступен

## 🔧 Если что-то не работает

1. **Проверьте PostgreSQL**: `pg_ctl status`
2. **Проверьте базу данных**: `psql -U postgres -d engcard_db -c "SELECT COUNT(*) FROM topics;"`
3. **Проверьте сервер**: `curl http://localhost:3001/health`
4. **Проверьте приложение**: `curl http://localhost:5173`

---

**Готово!** 🎉 Ваше приложение теперь работает с базой данных PostgreSQL!
