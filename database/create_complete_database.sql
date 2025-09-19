-- ==============================================
-- ПОЛНЫЙ СКРИПТ СОЗДАНИЯ БАЗЫ ДАННЫХ ENGCARD
-- ==============================================
-- Выполните этот скрипт в psql для создания всей структуры базы данных

-- Удаление существующих таблиц (если есть)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS word_tag_relations CASCADE;
DROP TABLE IF EXISTS word_tags CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS word_notes CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS difficulty_levels CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS words CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаление функций
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_next_achievement(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS check_data_integrity() CASCADE;
DROP FUNCTION IF EXISTS update_topic_words_count() CASCADE;
DROP FUNCTION IF EXISTS update_user_level() CASCADE;
DROP FUNCTION IF EXISTS update_user_points() CASCADE;
DROP FUNCTION IF EXISTS update_user_last_active() CASCADE;

-- ==============================================
-- 1. СОЗДАНИЕ ОСНОВНЫХ ТАБЛИЦ
-- ==============================================

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    language_code VARCHAR(10) DEFAULT 'ru',
    is_active BOOLEAN DEFAULT true,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    birth_date DATE,
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    last_active TIMESTAMP,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тем
CREATE TABLE topics (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    is_featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    words_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица слов
CREATE TABLE words (
    id VARCHAR(50) PRIMARY KEY,
    russian VARCHAR(200) NOT NULL,
    english VARCHAR(200) NOT NULL,
    topic_id VARCHAR(50) NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    pronunciation VARCHAR(200),
    example_sentence TEXT,
    synonyms TEXT[],
    antonyms TEXT[],
    usage_frequency INTEGER DEFAULT 1 CHECK (usage_frequency >= 1 AND usage_frequency <= 5),
    is_archived BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Таблица прогресса пользователей
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word_id VARCHAR(50) NOT NULL,
    topic_id VARCHAR(50) NOT NULL,
    correct_attempts INTEGER DEFAULT 0,
    incorrect_attempts INTEGER DEFAULT 0,
    last_studied TIMESTAMP,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    study_streak INTEGER DEFAULT 0 CHECK (study_streak >= 0 AND study_streak <= 100),
    last_correct_at TIMESTAMP,
    study_count INTEGER DEFAULT 0,
    average_response_time INTEGER DEFAULT 0 CHECK (average_response_time >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(user_id, word_id)
);

-- Таблица сессий изучения
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    topic_id VARCHAR(50) NOT NULL,
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    session_duration INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'normal',
    average_response_time INTEGER DEFAULT 0 CHECK (average_response_time >= 0),
    focus_score INTEGER DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- ==============================================
-- 2. СОЗДАНИЕ ДОПОЛНИТЕЛЬНЫХ ТАБЛИЦ
-- ==============================================

-- Таблица уровней сложности
CREATE TABLE difficulty_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    min_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    color VARCHAR(7) DEFAULT '#007bff',
    icon VARCHAR(10) DEFAULT '⭐',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица достижений
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '🏆',
    badge_color VARCHAR(7) DEFAULT '#ffd700',
    requirements JSONB,
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связи пользователей с достижениями
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_completed BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
);

-- Таблица настроек пользователей
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    daily_goal INTEGER DEFAULT 20,
    study_time_preference TIME DEFAULT '19:00:00',
    difficulty_preference INTEGER DEFAULT 1,
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(5) DEFAULT 'ru',
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица заметок к словам
CREATE TABLE word_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word_id VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- Таблица избранных слов
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word_id VARCHAR(50) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE(user_id, word_id)
);

-- Таблица тегов
CREATE TABLE word_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6c757d',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связи слов с тегами
CREATE TABLE word_tag_relations (
    id SERIAL PRIMARY KEY,
    word_id VARCHAR(50) NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES word_tags(id) ON DELETE CASCADE,
    UNIQUE(word_id, tag_id)
);

-- Таблица ежедневной статистики
CREATE TABLE daily_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    words_studied INTEGER DEFAULT 0 CHECK (words_studied >= 0),
    correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
    incorrect_answers INTEGER DEFAULT 0 CHECK (incorrect_answers >= 0),
    study_time_minutes INTEGER DEFAULT 0 CHECK (study_time_minutes >= 0 AND study_time_minutes <= 1440),
    streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

-- Таблица уведомлений
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================
-- 3. СОЗДАНИЕ ИНДЕКСОВ
-- ==============================================

-- Основные индексы
CREATE INDEX idx_words_topic_id ON words(topic_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_word_id ON user_progress(word_id);
CREATE INDEX idx_user_progress_topic_id ON user_progress(topic_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_topic_id ON study_sessions(topic_id);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Дополнительные индексы
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_word_notes_user_id ON word_notes(user_id);
CREATE INDEX idx_word_notes_word_id ON word_notes(word_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_word_id ON user_favorites(word_id);
CREATE INDEX idx_word_tag_relations_word_id ON word_tag_relations(word_id);
CREATE INDEX idx_word_tag_relations_tag_id ON word_tag_relations(tag_id);
CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Составные индексы
CREATE INDEX idx_user_progress_user_topic ON user_progress(user_id, topic_id, mastery_level);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);
CREATE INDEX idx_words_topic_difficulty ON words(topic_id, difficulty_level);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type, is_read);

-- Функциональные индексы
CREATE INDEX idx_words_russian_gin ON words USING gin(to_tsvector('russian', russian));
CREATE INDEX idx_words_english_gin ON words USING gin(to_tsvector('english', english));
CREATE INDEX idx_words_synonyms_gin ON words USING gin(synonyms);
CREATE INDEX idx_words_antonyms_gin ON words USING gin(antonyms);

-- ==============================================
-- 4. СОЗДАНИЕ ФУНКЦИЙ
-- ==============================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Функция для расчета уровня пользователя
CREATE OR REPLACE FUNCTION calculate_user_level(experience_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, FLOOR(experience_points / 100) + 1);
END;
$$ LANGUAGE plpgsql;

-- Функция для получения следующего достижения
CREATE OR REPLACE FUNCTION get_next_achievement(user_id INTEGER)
RETURNS TABLE(achievement_id INTEGER, name VARCHAR, description TEXT, progress INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.description,
        CASE 
            WHEN a.requirements->>'words_studied' IS NOT NULL THEN
                LEAST(100, (COUNT(DISTINCT up.word_id) * 100) / (a.requirements->>'words_studied')::INTEGER)
            WHEN a.requirements->>'streak' IS NOT NULL THEN
                LEAST(100, (MAX(up.study_streak) * 100) / (a.requirements->>'streak')::INTEGER)
            ELSE 0
        END as progress
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
    LEFT JOIN user_progress up ON up.user_id = $1
    WHERE ua.id IS NULL AND a.is_active = true
    GROUP BY a.id, a.name, a.description, a.requirements
    HAVING CASE 
        WHEN a.requirements->>'words_studied' IS NOT NULL THEN
            COUNT(DISTINCT up.word_id) < (a.requirements->>'words_studied')::INTEGER
        WHEN a.requirements->>'streak' IS NOT NULL THEN
            MAX(up.study_streak) < (a.requirements->>'streak')::INTEGER
        ELSE true
    END
    ORDER BY progress DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Функция для проверки целостности данных
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Проверка пользователей без настроек
    RETURN QUERY
    SELECT 
        'Пользователи без настроек'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
        'Найдено ' || COUNT(*) || ' пользователей без настроек'
    FROM users u
    LEFT JOIN user_settings us ON u.id = us.user_id
    WHERE us.user_id IS NULL;

    -- Проверка слов без тегов
    RETURN QUERY
    SELECT 
        'Слова без тегов'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'INFO' END,
        'Найдено ' || COUNT(*) || ' слов без тегов'
    FROM words w
    LEFT JOIN word_tag_relations wtr ON w.id = wtr.word_id
    WHERE wtr.word_id IS NULL AND w.is_archived = false;

    -- Проверка пользователей без статистики
    RETURN QUERY
    SELECT 
        'Пользователи без статистики'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'INFO' END,
        'Найдено ' || COUNT(*) || ' пользователей без статистики'
    FROM users u
    LEFT JOIN user_progress up ON u.id = up.user_id
    WHERE up.user_id IS NULL AND u.is_active = true;

END;
$$ LANGUAGE plpgsql;

-- Функция для обновления счетчика слов в темах
CREATE OR REPLACE FUNCTION update_topic_words_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE topics 
        SET words_count = (
            SELECT COUNT(*) 
            FROM words 
            WHERE topic_id = NEW.topic_id AND is_archived = false
        )
        WHERE id = NEW.topic_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE topics 
        SET words_count = (
            SELECT COUNT(*) 
            FROM words 
            WHERE topic_id = OLD.topic_id AND is_archived = false
        )
        WHERE id = OLD.topic_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- ==============================================
-- 5. СОЗДАНИЕ ТРИГГЕРОВ
-- ==============================================

-- Триггеры для обновления updated_at
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_notes_updated_at BEFORE UPDATE ON word_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления счетчика слов в темах
CREATE TRIGGER update_topic_words_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON words
    FOR EACH ROW EXECUTE FUNCTION update_topic_words_count();

-- ==============================================
-- 6. ЗАПОЛНЕНИЕ ТЕСТОВЫМИ ДАННЫМИ
-- ==============================================

-- Вставка тем
INSERT INTO topics (id, name, icon, emoji, description, color, is_featured, order_index) VALUES
('music', 'music', '🎧', '🎵', 'Музыкальная тематика', '#28a745', true, 1),
('cinema', 'cinema', '🎬', '🎭', 'Кинематограф', '#17a2b8', true, 2),
('travel', 'travel', '🚂', '✈️', 'Путешествия', '#ffc107', true, 3),
('animals', 'animals', '🐕', '🐾', 'Животные', '#fd7e14', false, 4),
('hobby', 'hobby', '🎮', '🎯', 'Хобби', '#6f42c1', false, 5),
('weather', 'weather', '☁️', '🌤️', 'Погода', '#20c997', false, 6),
('food', 'food', '🍕', '🍽️', 'Еда', '#e83e8c', false, 7),
('sports', 'sports', '⚽', '🏆', 'Спорт', '#dc3545', false, 8),
('technology', 'technology', '💻', '📱', 'Технологии', '#6c757d', false, 9),
('nature', 'nature', '🌳', '🌿', 'Природа', '#28a745', false, 10);

-- Вставка уровней сложности
INSERT INTO difficulty_levels (name, description, min_score, max_score, color, icon) VALUES
('Начинающий', 'Базовые слова для изучения', 0, 20, '#28a745', '🌱'),
('Элементарный', 'Простые повседневные слова', 21, 40, '#17a2b8', '📚'),
('Средний', 'Слова среднего уровня сложности', 41, 60, '#ffc107', '⭐'),
('Продвинутый', 'Сложные слова и выражения', 61, 80, '#fd7e14', '🔥'),
('Эксперт', 'Профессиональная лексика', 81, 100, '#dc3545', '👑');

-- Вставка достижений
INSERT INTO achievements (name, description, icon, badge_color, requirements, points) VALUES
('Первые шаги', 'Изучите первое слово', '🎯', '#28a745', '{"words_studied": 1}', 10),
('Настойчивый', 'Изучите 10 слов', '💪', '#17a2b8', '{"words_studied": 10}', 50),
('Словарный запас', 'Изучите 50 слов', '📖', '#ffc107', '{"words_studied": 50}', 200),
('Мастер слов', 'Изучите 100 слов', '🏆', '#fd7e14', '{"words_studied": 100}', 500),
('Серия побед', 'Правильно ответьте 10 раз подряд', '🔥', '#dc3545', '{"streak": 10}', 100),
('Ежедневная практика', 'Изучайте слова 7 дней подряд', '📅', '#6f42c1', '{"daily_streak": 7}', 300),
('Скоростной', 'Ответьте за 5 секунд', '⚡', '#20c997', '{"response_time": 5}', 75),
('Точность', '95% правильных ответов', '🎯', '#e83e8c', '{"accuracy": 95}', 150);

-- Вставка тегов
INSERT INTO word_tags (name, color, description) VALUES
('Повседневность', '#28a745', 'Слова для повседневного общения'),
('Бизнес', '#007bff', 'Деловая лексика'),
('Путешествия', '#17a2b8', 'Слова для путешествий'),
('Еда', '#fd7e14', 'Кулинарная лексика'),
('Спорт', '#dc3545', 'Спортивная терминология'),
('Технологии', '#6f42c1', 'IT и техническая лексика'),
('Природа', '#20c997', 'Природная тематика'),
('Искусство', '#e83e8c', 'Творческая лексика');

-- Вставка слов
INSERT INTO words (id, russian, english, topic_id, difficulty_level, pronunciation, example_sentence, usage_frequency) VALUES
-- Music words
('music-1', 'музыка', 'music', 'music', 1, '[ˈmjuːzɪk]', 'I love listening to music.', 5),
('music-2', 'песня', 'song', 'music', 1, '[sɒŋ]', 'This is my favorite song.', 5),
('music-3', 'гитара', 'guitar', 'music', 2, '[ɡɪˈtɑːr]', 'He plays the guitar beautifully.', 4),
('music-4', 'пианино', 'piano', 'music', 2, '[piˈænoʊ]', 'She is learning to play the piano.', 4),
('music-5', 'барабан', 'drum', 'music', 2, '[drʌm]', 'The drums sound amazing.', 3),
('music-6', 'концерт', 'concert', 'music', 3, '[ˈkɒnsərt]', 'We went to a rock concert.', 4),
('music-7', 'мелодия', 'melody', 'music', 3, '[ˈmelədi]', 'This melody is unforgettable.', 3),
('music-8', 'ритм', 'rhythm', 'music', 3, '[ˈrɪðəm]', 'Feel the rhythm of the music.', 3),

-- Cinema words
('cinema-1', 'кино', 'cinema', 'cinema', 1, '[ˈsɪnəmə]', 'Let''s go to the cinema.', 4),
('cinema-2', 'фильм', 'movie', 'cinema', 1, '[ˈmuːvi]', 'This movie is fantastic.', 5),
('cinema-3', 'актер', 'actor', 'cinema', 2, '[ˈæktər]', 'He is a famous actor.', 4),
('cinema-4', 'режиссер', 'director', 'cinema', 3, '[dɪˈrektər]', 'The director won an Oscar.', 3),
('cinema-5', 'сценарий', 'script', 'cinema', 3, '[skrɪpt]', 'The script is well-written.', 3),
('cinema-6', 'премьера', 'premiere', 'cinema', 4, '[prɪˈmɪər]', 'The movie premiere was spectacular.', 2),
('cinema-7', 'билет', 'ticket', 'cinema', 1, '[ˈtɪkɪt]', 'I need to buy a ticket.', 4),
('cinema-8', 'попкорн', 'popcorn', 'cinema', 2, '[ˈpɒpkɔːrn]', 'Popcorn is a must at the movies.', 3),

-- Travel words
('travel-1', 'путешествие', 'travel', 'travel', 2, '[ˈtrævəl]', 'I love to travel around the world.', 4),
('travel-2', 'самолет', 'airplane', 'travel', 2, '[ˈeərpleɪn]', 'The airplane is ready for takeoff.', 4),
('travel-3', 'поезд', 'train', 'travel', 1, '[treɪn]', 'The train arrives at 3 PM.', 4),
('travel-4', 'отель', 'hotel', 'travel', 2, '[hoʊˈtel]', 'We stayed at a luxury hotel.', 4),
('travel-5', 'паспорт', 'passport', 'travel', 3, '[ˈpæspɔːrt]', 'Don''t forget your passport.', 3),
('travel-6', 'чемодан', 'suitcase', 'travel', 2, '[ˈsuːtkeɪs]', 'Pack your suitcase carefully.', 3),
('travel-7', 'карта', 'map', 'travel', 1, '[mæp]', 'Use the map to find the way.', 4),
('travel-8', 'достопримечательность', 'landmark', 'travel', 4, '[ˈlændmɑːrk]', 'This landmark is famous worldwide.', 2),

-- Animals words
('animals-1', 'животное', 'animal', 'animals', 1, '[ˈænɪməl]', 'Dogs are loyal animals.', 4),
('animals-2', 'собака', 'dog', 'animals', 1, '[dɔːɡ]', 'My dog is very friendly.', 5),
('animals-3', 'кошка', 'cat', 'animals', 1, '[kæt]', 'The cat is sleeping on the sofa.', 5),
('animals-4', 'птица', 'bird', 'animals', 1, '[bɜːrd]', 'Birds can fly high in the sky.', 4),
('animals-5', 'рыба', 'fish', 'animals', 1, '[fɪʃ]', 'Fish live in water.', 4),
('animals-6', 'слон', 'elephant', 'animals', 2, '[ˈelɪfənt]', 'Elephants are very large animals.', 3),
('animals-7', 'лев', 'lion', 'animals', 2, '[ˈlaɪən]', 'The lion is the king of the jungle.', 3),
('animals-8', 'медведь', 'bear', 'animals', 2, '[beər]', 'Bears hibernate in winter.', 3),

-- Hobby words
('hobby-1', 'хобби', 'hobby', 'hobby', 1, '[ˈhɑːbi]', 'Reading is my favorite hobby.', 4),
('hobby-2', 'чтение', 'reading', 'hobby', 2, '[ˈriːdɪŋ]', 'Reading books is very relaxing.', 4),
('hobby-3', 'рисование', 'drawing', 'hobby', 2, '[ˈdrɔːɪŋ]', 'Drawing helps me express creativity.', 3),
('hobby-4', 'спорт', 'sport', 'hobby', 1, '[spɔːrt]', 'Sport is good for health.', 4),
('hobby-5', 'игра', 'game', 'hobby', 1, '[ɡeɪm]', 'Let''s play a game together.', 4),
('hobby-6', 'коллекция', 'collection', 'hobby', 3, '[kəˈlekʃən]', 'My stamp collection is valuable.', 2),
('hobby-7', 'фотография', 'photography', 'hobby', 3, '[fəˈtɑːɡrəfi]', 'Photography is an art form.', 3),
('hobby-8', 'садоводство', 'gardening', 'hobby', 3, '[ˈɡɑːrdənɪŋ]', 'Gardening is therapeutic.', 2),

-- Weather words
('weather-1', 'погода', 'weather', 'weather', 1, '[ˈweðər]', 'The weather is nice today.', 5),
('weather-2', 'солнце', 'sun', 'weather', 1, '[sʌn]', 'The sun is shining brightly.', 5),
('weather-3', 'дождь', 'rain', 'weather', 1, '[reɪn]', 'It''s raining outside.', 4),
('weather-4', 'снег', 'snow', 'weather', 1, '[snoʊ]', 'Snow is falling from the sky.', 3),
('weather-5', 'облако', 'cloud', 'weather', 1, '[klaʊd]', 'Clouds are white and fluffy.', 4),
('weather-6', 'ветер', 'wind', 'weather', 1, '[wɪnd]', 'The wind is blowing strongly.', 4),
('weather-7', 'температура', 'temperature', 'weather', 2, '[ˈtemprətʃər]', 'The temperature is rising.', 3),
('weather-8', 'гроза', 'thunderstorm', 'weather', 3, '[ˈθʌndərstɔːrm]', 'The thunderstorm was scary.', 2);

-- Вставка тестовых пользователей
INSERT INTO users (telegram_id, username, first_name, last_name, language_code, total_points, level, experience_points) VALUES
(123456789, 'test_user_1', 'Анна', 'Иванова', 'ru', 150, 2, 150),
(987654321, 'test_user_2', 'Петр', 'Петров', 'ru', 300, 3, 300),
(555666777, 'test_user_3', 'Мария', 'Сидорова', 'ru', 75, 1, 75),
(111222333, 'test_user_4', 'Алексей', 'Козлов', 'ru', 500, 5, 500),
(444555666, 'test_user_5', 'Елена', 'Морозова', 'ru', 200, 2, 200);

-- Вставка настроек для пользователей
INSERT INTO user_settings (user_id, daily_goal, study_time_preference, difficulty_preference, theme) VALUES
(1, 20, '19:00:00', 2, 'light'),
(2, 30, '20:00:00', 3, 'dark'),
(3, 15, '18:00:00', 1, 'light'),
(4, 40, '21:00:00', 4, 'dark'),
(5, 25, '19:30:00', 2, 'light');

-- Вставка тегов к словам
INSERT INTO word_tag_relations (word_id, tag_id) VALUES
-- Music words -> Искусство
('music-1', 8), ('music-2', 8), ('music-3', 8), ('music-4', 8), ('music-5', 8), ('music-6', 8), ('music-7', 8), ('music-8', 8),
-- Cinema words -> Искусство
('cinema-1', 8), ('cinema-2', 8), ('cinema-3', 8), ('cinema-4', 8), ('cinema-5', 8), ('cinema-6', 8), ('cinema-7', 8), ('cinema-8', 8),
-- Travel words -> Путешествия
('travel-1', 3), ('travel-2', 3), ('travel-3', 3), ('travel-4', 3), ('travel-5', 3), ('travel-6', 3), ('travel-7', 3), ('travel-8', 3),
-- Animals words -> Природа
('animals-1', 7), ('animals-2', 7), ('animals-3', 7), ('animals-4', 7), ('animals-5', 7), ('animals-6', 7), ('animals-7', 7), ('animals-8', 7),
-- Hobby words -> Повседневность
('hobby-1', 1), ('hobby-2', 1), ('hobby-3', 1), ('hobby-4', 1), ('hobby-5', 1), ('hobby-6', 1), ('hobby-7', 1), ('hobby-8', 1),
-- Weather words -> Природа
('weather-1', 7), ('weather-2', 7), ('weather-3', 7), ('weather-4', 7), ('weather-5', 7), ('weather-6', 7), ('weather-7', 7), ('weather-8', 7);

-- ==============================================
-- 7. СОЗДАНИЕ ПРЕДСТАВЛЕНИЙ
-- ==============================================

-- Представление для статистики пользователей
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.telegram_id,
    u.first_name,
    u.last_name,
    u.total_points,
    u.level,
    u.experience_points,
    COUNT(DISTINCT up.word_id) as words_studied,
    SUM(up.correct_attempts) as total_correct,
    SUM(up.incorrect_attempts) as total_incorrect,
    AVG(up.mastery_level) as average_mastery,
    COUNT(DISTINCT ss.id) as total_sessions,
    MAX(ss.started_at) as last_study_session
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN study_sessions ss ON u.id = ss.user_id
GROUP BY u.id, u.telegram_id, u.first_name, u.last_name, u.total_points, u.level, u.experience_points;

-- Представление для популярных слов
CREATE VIEW popular_words AS
SELECT 
    w.id,
    w.russian,
    w.english,
    w.topic_id,
    t.name as topic_name,
    w.views_count,
    w.likes_count,
    COUNT(DISTINCT up.user_id) as users_studied,
    AVG(up.mastery_level) as average_mastery
FROM words w
JOIN topics t ON w.topic_id = t.id
LEFT JOIN user_progress up ON w.id = up.word_id
WHERE w.is_archived = false
GROUP BY w.id, w.russian, w.english, w.topic_id, t.name, w.views_count, w.likes_count
ORDER BY (w.views_count + w.likes_count + COUNT(DISTINCT up.user_id)) DESC;

-- ==============================================
-- 8. ФИНАЛЬНАЯ ПРОВЕРКА
-- ==============================================

-- Вывод статистики
SELECT 'База данных EngCard создана успешно!' as status;

SELECT 
    'Создано таблиц' as metric,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 
    'Создано связей' as metric,
    COUNT(*) as count
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';

SELECT 
    'Создано индексов' as metric,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'public';

-- Статистика по данным
SELECT 'Темы' as table_name, COUNT(*) as count FROM topics
UNION ALL
SELECT 'Слова', COUNT(*) FROM words
UNION ALL
SELECT 'Пользователи', COUNT(*) FROM users
UNION ALL
SELECT 'Достижения', COUNT(*) FROM achievements
UNION ALL
SELECT 'Теги', COUNT(*) FROM word_tags
UNION ALL
SELECT 'Настройки', COUNT(*) FROM user_settings;

-- Проверка целостности
SELECT * FROM check_data_integrity();

SELECT 'Готово к использованию! 🎉' as final_status;


