import { createStore, createEvent, createEffect, sample } from 'effector';
import { loadTopicsFx, addTopic } from './topics';
import { loadTopicsProgress, addTopicProgress } from './progress';

// События
export const importTopicFromExcel = createEvent<File>();
export const setImportModalOpen = createEvent<boolean>();

// Эффекты
export const importTopicFromExcelFx = createEffect(async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3001/api/import/topic', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json() as { error?: string };
    throw new Error(errorData.error || 'Ошибка при импорте топика');
  }

  return response.json() as { success: boolean; message: string; topic?: any; wordsCount?: number };
});

// Сторы
export const $importModalOpen = createStore(false);
export const $isImporting = createStore(false);
export const $importResult = createStore<{ success: boolean; message: string; topic?: any; wordsCount?: number } | null>(null);

// Обновление сторов
$importModalOpen
  .on(setImportModalOpen, (_, isOpen) => isOpen)
  .on(importTopicFromExcelFx.done, () => false)
  .on(importTopicFromExcelFx.fail, () => false);

$isImporting
  .on(importTopicFromExcelFx.pending, (_, pending) => pending);

$importResult
  .on(importTopicFromExcelFx.doneData, (_, result: { success: boolean; message: string; topic?: any; wordsCount?: number }) => ({
    success: true,
    message: result.message,
    topic: result.topic,
    wordsCount: result.wordsCount
  }))
  .on(importTopicFromExcelFx.failData, (_, error: Error) => ({
    success: false,
    message: error.message || 'Ошибка при импорте'
  }))
  .on(setImportModalOpen, () => null);

// Автоматически добавляем новый топик в store после успешного импорта
sample({
  clock: importTopicFromExcelFx.doneData,
  fn: (result) => result.topic,
  filter: (topic) => !!topic,
  target: addTopic
});

// Также обновляем полный список топиков для синхронизации
sample({
  clock: importTopicFromExcelFx.done,
  target: loadTopicsFx
});

// Автоматически добавляем прогресс для нового топика
sample({
  clock: importTopicFromExcelFx.doneData,
  fn: (result) => {
    if (result.topic) {
      // Создаем начальный прогресс для нового топика
      return {
        topic_id: result.topic.id,
        topic_name: result.topic.name,
        total_words: result.wordsCount || 0,
        learned_words: 0,
        studying_words: 0,
        progress_percentage: 0
      };
    }
    return null;
  },
  filter: (progress) => progress !== null,
  target: addTopicProgress
});

// Также перезагружаем прогресс с сервера для синхронизации
sample({
  clock: importTopicFromExcelFx.done,
  fn: () => 1, // userId = 1
  target: loadTopicsProgress
});

// Связывание событий с эффектами
sample({
  clock: importTopicFromExcel,
  target: importTopicFromExcelFx
});
