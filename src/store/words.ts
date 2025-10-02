import { createStore, createEvent, createEffect } from 'effector'

export interface Word {
  id: string
  russian: string
  english: string
  topic_id: string
  difficulty_level?: number
  pronunciation?: string
  example_sentence?: string
  usage_frequency?: number
  views_count?: number
  likes_count?: number
  created_at?: string
  updated_at?: string
}

// События
export const loadWords = createEvent()
export const loadWordsByTopic = createEvent<string>()
export const setWords = createEvent<Word[]>()
export const nextWord = createEvent()
export const previousWord = createEvent()
export const resetWordIndex = createEvent()
export const setWordIndex = createEvent<number>()

// Эффект для загрузки всех слов из API
export const loadWordsFx = createEffect(async () => {
  try {
    console.log('🔄 Загружаем слова из API...')
    const response = await fetch('http://localhost:3001/api/words')
    console.log('📡 Ответ от API:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to load words: ${response.status} ${response.statusText}`)
    }
    
    const words = await response.json()
    console.log('✅ Слова загружены:', words.length, 'штук')
    return words
  } catch (error) {
    console.error('❌ Ошибка загрузки слов:', error)
    console.log('🔄 Используем fallback данные...')
    // Возвращаем fallback данные при ошибке
    return [
      { id: 'music-1', russian: 'музыка', english: 'music', topic_id: 'music' },
      { id: 'music-2', russian: 'песня', english: 'song', topic_id: 'music' },
      { id: 'cinema-1', russian: 'кино', english: 'cinema', topic_id: 'cinema' },
      { id: 'cinema-2', russian: 'фильм', english: 'movie', topic_id: 'cinema' },
      { id: 'travel-1', russian: 'путешествие', english: 'travel', topic_id: 'travel' },
      { id: 'travel-2', russian: 'самолет', english: 'airplane', topic_id: 'travel' },
      { id: 'animals-1', russian: 'животное', english: 'animal', topic_id: 'animals' },
      { id: 'animals-2', russian: 'собака', english: 'dog', topic_id: 'animals' },
      { id: 'hobby-1', russian: 'хобби', english: 'hobby', topic_id: 'hobby' },
      { id: 'hobby-2', russian: 'чтение', english: 'reading', topic_id: 'hobby' },
      { id: 'weather-1', russian: 'погода', english: 'weather', topic_id: 'weather' },
      { id: 'weather-2', russian: 'солнце', english: 'sun', topic_id: 'weather' },
    ]
  }
})

// Эффект для загрузки слов по теме
export const loadWordsByTopicFx = createEffect(async (topicId: string) => {
  try {
    console.log(`🔄 Загружаем слова для темы "${topicId}"...`)
    const response = await fetch(`http://localhost:3001/api/words/topic/${topicId}`)
    console.log('📡 Ответ от API:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`Failed to load words by topic: ${response.status} ${response.statusText}`)
    }
    
    const words = await response.json()
    console.log(`✅ Слова для темы "${topicId}" загружены:`, words.length, 'штук')
    return words
  } catch (error) {
    console.error(`❌ Ошибка загрузки слов для темы "${topicId}":`, error)
    return []
  }
})

// Store для навигации по словам
export const $currentWordIndex = createStore<number>(0)
  .on(nextWord, (index, _) => index + 1)
  .on(previousWord, (index, _) => Math.max(0, index - 1))
  .on(resetWordIndex, () => 0)
  .on(setWordIndex, (_, index) => index)

// Store
export const $words = createStore<Word[]>([])
  .on(loadWordsFx.doneData, (_, words) => words)
  .on(loadWordsByTopicFx.doneData, (_, words) => words)
  .on(setWords, (_, words) => words)

// Автоматическая загрузка при инициализации
loadWordsFx()
