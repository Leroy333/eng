import { createStore, createEvent, createEffect, sample } from 'effector';
import type { TopicProgress, WordProgress } from '../database/models';

// События
export const loadTopicsProgress = createEvent<number>();
export const loadTopicProgress = createEvent<{ userId: number; topicId: string }>();
export const loadWordsProgress = createEvent<{ userId: number; topicId: string }>();
export const markWordAsLearned = createEvent<{ userId: number; wordId: string }>();
export const addTopicProgress = createEvent<TopicProgress>();

// Эффекты
export const loadTopicsProgressFx = createEffect(async (userId: number) => {
  const response = await fetch(`http://localhost:3001/api/users/${userId}/topics/progress`);
  if (!response.ok) throw new Error('Failed to load topics progress');
  return response.json();
});

export const loadTopicProgressFx = createEffect(async ({ userId, topicId }: { userId: number; topicId: string }) => {
  const response = await fetch(`http://localhost:3001/api/users/${userId}/topics/${topicId}/progress`);
  if (!response.ok) throw new Error('Failed to load topic progress');
  return response.json();
});

export const loadWordsProgressFx = createEffect(async ({ userId, topicId }: { userId: number; topicId: string }) => {
  let url;
  if (topicId === 'all') {
    url = `http://localhost:3001/api/users/${userId}/words/progress`;
  } else {
    url = `http://localhost:3001/api/users/${userId}/topics/${topicId}/words/progress`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load words progress');
  return response.json();
});

export const markWordAsLearnedFx = createEffect(async ({ userId, wordId }: { userId: number; wordId: string }) => {
  console.log('🚀 Отправляем запрос на отметку слова как изученного:', { userId, wordId });
  const response = await fetch(`http://localhost:3001/api/users/${userId}/words/${wordId}/learned`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    console.error('❌ Ошибка при отметке слова как изученного:', response.status, response.statusText);
    throw new Error('Failed to mark word as learned');
  }
  const result = await response.json();
  console.log('✅ Слово успешно отмечено как изученное:', result);
  return result;
});


// Сторы
export const $topicsProgress = createStore<TopicProgress[]>([]);
export const $currentTopicProgress = createStore<TopicProgress | null>(null);
export const $wordsProgress = createStore<WordProgress[]>([]);
export const $isLoadingProgress = createStore(false);

// Обновление сторов
$topicsProgress
  .on(loadTopicsProgressFx.doneData, (_, data) => data)
  .on(loadTopicsProgressFx.fail, (state) => state)
  .on(addTopicProgress, (topics, newTopicProgress) => {
    console.log('➕ Добавляем прогресс нового топика:', newTopicProgress.topic_name);
    // Проверяем, нет ли уже такого топика в списке
    const existingIndex = topics.findIndex(topic => topic.topic_id === newTopicProgress.topic_id);
    if (existingIndex >= 0) {
      // Обновляем существующий
      const updated = [...topics];
      updated[existingIndex] = newTopicProgress;
      return updated;
    } else {
      // Добавляем новый
      return [...topics, newTopicProgress];
    }
  });

$currentTopicProgress
  .on(loadTopicProgressFx.doneData, (_, data) => data)
  .on(loadTopicProgressFx.fail, (state) => state);

$wordsProgress
  .on(loadWordsProgressFx.doneData, (_, data) => {
    // Если это данные для всех слов, используем wordsProgress, иначе data
    return data.wordsProgress || data;
  })
  .on(loadWordsProgressFx.fail, (state) => state);

$isLoadingProgress
  .on(loadTopicsProgressFx.pending, (_, pending) => pending)
  .on(loadTopicProgressFx.pending, (_, pending) => pending)
  .on(loadWordsProgressFx.pending, (_, pending) => pending)
  .on(markWordAsLearnedFx.pending, (_, pending) => pending);

// Связывание событий с эффектами
sample({
  clock: loadTopicsProgress,
  target: loadTopicsProgressFx
});

sample({
  clock: loadTopicProgress,
  target: loadTopicProgressFx
});

sample({
  clock: loadWordsProgress,
  target: loadWordsProgressFx
});

sample({
  clock: markWordAsLearned,
  target: markWordAsLearnedFx
});


// Обновление прогресса после изменения статуса слова
sample({
  clock: markWordAsLearnedFx.done,
  source: $currentTopicProgress,
  filter: (topicProgress) => topicProgress !== null,
  fn: (topicProgress) => ({ userId: 1, topicId: topicProgress!.topic_id }),
  target: loadTopicProgress
});


// Автоматический переход к следующему слову убираем, чтобы избежать конфликтов