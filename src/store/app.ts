import { createStore, createEvent, createEffect } from 'effector'

export type AppPage = 'onboarding' | 'dashboard' | 'wordCards' | 'statistics'

export const $currentPage = createStore<AppPage>('onboarding')
export const $newWordsCount = createStore<number>(20)
export const $userName = createStore<string>('Пользователь')
export const $selectedTopicId = createStore<string | null>(null)

export const setCurrentPage = createEvent<AppPage>()
export const setNewWordsCount = createEvent<number>()
export const setUserName = createEvent<string>()
export const setSelectedTopicId = createEvent<string | null>()
export const loadRecommendedWords = createEvent<number>() // userId
export const loadOverallProgress = createEvent<number>() // userId
export const markRecommendedWordAsLearned = createEvent<string>() // wordId

// Эффект для загрузки рекомендованных слов
export const loadRecommendedWordsFx = createEffect(async (userId: number) => {
  try {
    console.log('🔄 Загружаем рекомендованные слова для пользователя:', userId)
    const response = await fetch(`http://localhost:3001/api/users/${userId}/recommended-words`)
    if (!response.ok) throw new Error('Failed to load recommended words')
    const data = await response.json()
    console.log('✅ Рекомендованные слова загружены:', data.words.length, 'штук')
    return data
  } catch (error) {
    console.error('❌ Ошибка загрузки рекомендованных слов:', error)
    // Возвращаем fallback данные
    return { words: [], count: 0 }
  }
})

// Эффект для загрузки общего прогресса
export const loadOverallProgressFx = createEffect(async (userId: number) => {
  try {
    console.log('🔄 Загружаем общий прогресс для пользователя:', userId)
    const response = await fetch(`http://localhost:3001/api/users/${userId}/overall-progress`)
    if (!response.ok) throw new Error('Failed to load overall progress')
    const data = await response.json()
    console.log('✅ Общий прогресс загружен:', data.progress)
    return data.progress
  } catch (error) {
    console.error('❌ Ошибка загрузки общего прогресса:', error)
    return { total_words: 0, learned_words: 0, studying_words: 0, new_words: 0, progress_percentage: 0 }
  }
})

// Store для рекомендованных слов
export const $recommendedWords = createStore<any[]>([])
export const $recommendedWordsCount = createStore<number>(0)

// Store для общего прогресса
export const $overallProgress = createStore<any>(null)

$currentPage.on(setCurrentPage, (_, page) => page)
$newWordsCount.on(setNewWordsCount, (_, count) => count)
$userName.on(setUserName, (_, name) => name)
$selectedTopicId.on(setSelectedTopicId, (_, topicId) => topicId)

// Обновление store рекомендованных слов
$recommendedWords
  .on(loadRecommendedWordsFx.doneData, (_, data) => data.words)
  .on(markRecommendedWordAsLearned, (words, wordId) => {
    console.log('🔄 Обновляем статус слова в рекомендованных:', wordId)
    return words.map(word => 
      word.id === wordId 
        ? { ...word, status: 'learned' }
        : word
    )
  })
$recommendedWordsCount.on(loadRecommendedWordsFx.doneData, (_, data) => data.count)

// Обновление store общего прогресса
$overallProgress.on(loadOverallProgressFx.doneData, (_, data) => data)

// Связывание событий
loadRecommendedWords.watch((userId) => {
  loadRecommendedWordsFx(userId)
})

loadOverallProgress.watch((userId) => {
  loadOverallProgressFx(userId)
})
