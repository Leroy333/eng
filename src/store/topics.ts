import { createStore, createEvent, createEffect } from 'effector'

export interface Topic {
  id: string
  name: string
  icon: string
  emoji: string
  description?: string
  color?: string
  words_count?: number
  created_at?: string
  updated_at?: string
}

// События
export const loadTopics = createEvent()
export const setTopics = createEvent<Topic[]>()

// Эффект для загрузки тем из API
export const loadTopicsFx = createEffect(async () => {
  try {
    console.log('🔄 Загружаем темы из API...')
    const response = await fetch('http://localhost:3001/api/topics')
    console.log('📡 Ответ от API:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to load topics: ${response.status} ${response.statusText}`)
    }
    
    const topics = await response.json()
    console.log('✅ Темы загружены:', topics.length, 'штук')
    return topics
  } catch (error) {
    console.error('❌ Ошибка загрузки тем:', error)
    console.log('🔄 Используем fallback данные...')
    // Возвращаем fallback данные при ошибке
    return [
      { id: 'music', name: 'music', icon: '🎧', emoji: '🎵' },
      { id: 'cinema', name: 'cinema', icon: '🎬', emoji: '🎭' },
      { id: 'travel', name: 'travel', icon: '🚂', emoji: '✈️' },
      { id: 'animals', name: 'animals', icon: '🐕', emoji: '🐾' },
      { id: 'hobby', name: 'hobby', icon: '🎮', emoji: '🎯' },
      { id: 'weather', name: 'weather', icon: '☁️', emoji: '🌤️' }
    ]
  }
})

// Store
export const $topics = createStore<Topic[]>([])
  .on(loadTopicsFx.doneData, (_, topics) => {
    console.log('📝 Store topics обновлен:', topics.length, 'тем')
    return topics
  })
  .on(setTopics, (_, topics) => {
    console.log('📝 Store topics установлен вручную:', topics.length, 'тем')
    return topics
  })

// Автоматическая загрузка при инициализации
loadTopicsFx()
