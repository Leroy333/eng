import React, { useState, useEffect, useLayoutEffect } from 'react'
import styled from 'styled-components'
import { useUnit } from 'effector-react'
import { $words, loadWordsByTopicFx, $currentWordIndex, nextWord, previousWord, resetWordIndex, setWordIndex } from '../store/words'
import { $topics } from '../store/topics'
import { $selectedTopicId, $recommendedWords, loadRecommendedWordsFx, $overallProgress, loadOverallProgress, markRecommendedWordAsLearned, setCurrentPage } from '../store/app'
import { $wordsProgress, $currentTopicProgress, markWordAsLearned, loadWordsProgress, loadTopicProgress } from '../store/progress'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, Shuffle, Check } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

const WordCardContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: ${({ theme }) => theme.colors.light};
`

const Header = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.tablet} {
    margin: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg} 0 ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.dark};
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGray};
  }

  ${({ theme }) => theme.media.mobile} {
    width: 40px;
    height: 40px;
  }
`

const TopicInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const TopicIcon = styled.div`
  font-size: 24px;
`

const TopicName = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin: 0;
  text-transform: lowercase;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.lg};
  }
`

const CardSection = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: 0 ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xxxl};
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.media.mobile} {
    margin: 0 ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    margin: 0 ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`

const WordCard = styled.div<{ $isFlipped: boolean }>`
  width: 100%;
  max-width: 400px;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;

  ${({ theme }) => theme.media.mobile} {
    height: 250px;
  }
`

const CardInner = styled.div<{ $isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${({ $isFlipped }) => $isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
`

const CardFront = styled(CardFace)`
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.dark};
`

const CardBack = styled(CardFace)`
  background: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.light};
  transform: rotateY(180deg);
`

const WordText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xxxl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.xxl};
  }
`

const WordHint = styled.div`
  font-size: ${({ theme }) => theme.fontSize.md};
  opacity: 0.7;
  text-transform: lowercase;
`

const WordDetails = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSize.sm};
  opacity: 0.6;
  text-align: center;
`

const Pronunciation = styled.div`
  font-style: italic;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ExampleSentence = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  opacity: 0.8;
  line-height: 1.4;
`

const Controls = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-around;
  align-items: center;

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.tablet} {
    margin: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const ControlButton = styled.button<{ $variant?: 'success' | 'error' | 'default' }>`
  background: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success': return theme.colors.primary;
      case 'error': return '#FF4757';
      default: return theme.colors.light;
    }
  }};
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ $variant, theme }) => $variant === 'default' ? theme.colors.dark : theme.colors.dark};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ $variant, theme }) => {
      switch ($variant) {
        case 'success': return theme.colors.primary;
        case 'error': return '#FF4757';
        default: return theme.colors.white;
      }
    }};
    color: ${({ $variant, theme }) => $variant === 'default' ? theme.colors.dark : theme.colors.dark};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    color: ${({ theme }) => theme.colors.gray};
  }

  ${({ theme }) => theme.media.mobile} {
    width: 40px;
    height: 40px;
  }
`

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`

const ProgressText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
  text-transform: lowercase;
`

const ProgressNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.light};
`

const ProgressBarContainer = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const ProgressBarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ProgressBarTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin: 0;
`

const ProgressBarStats = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ProgressBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  width: ${({ $percentage }) => $percentage}%;
  transition: width 0.3s ease;
`

const ProgressBarPercentage = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
`

const LearningButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`

const LearningButton = styled.button<{ $variant: 'learned' }>`
  background: #4CAF50;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: white;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s;

  &:hover {
    background: #45a049;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

export const WordCardScreen: React.FC = () => {
  const words = useUnit($words)
  const topics = useUnit($topics)
  const selectedTopicId = useUnit($selectedTopicId)
  const recommendedWords = useUnit($recommendedWords)
  const overallProgress = useUnit($overallProgress)
  const wordsProgress = useUnit($wordsProgress)
  const currentTopicProgress = useUnit($currentTopicProgress)
  const currentWordIndex = useUnit($currentWordIndex)
  const isLoading = useUnit(loadWordsByTopicFx.pending)
  const isRecommendedLoading = useUnit(loadRecommendedWordsFx.pending)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRandomOrder, setIsRandomOrder] = useState(false)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set())

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId)
  
  // Определяем, какие слова использовать
  const isRecommendedMode = !selectedTopicId
  const sourceWords = isRecommendedMode ? recommendedWords : words.filter(word => word.topic_id === selectedTopicId)
  
  // Фильтруем слова, исключая изученные (для всех режимов)
  const availableWords = sourceWords.filter(word => {
    if (isRecommendedMode) {
      // В режиме рекомендованных слов проверяем статус из самих рекомендованных слов
      // Дополнительно проверяем, не изучено ли слово в базе данных
      const progress = wordsProgress.find(p => p.word_id === word.id)
      return word.status !== 'learned' && !progress?.learned
    } else {
      // В обычном режиме используем wordsProgress
      const progress = wordsProgress.find(p => p.word_id === word.id)
      return !progress?.learned
    }
  })
  
  // Получаем текущее слово с учетом случайного порядка
  const getCurrentWord = () => {
    console.log('🔍 Получение текущего слова:', {
      currentWordIndex,
      availableWordsLength: availableWords.length,
      isRandomOrder,
      shuffledIndicesLength: shuffledIndices.length
    })
    
    if (isRandomOrder && shuffledIndices.length > 0) {
      const actualIndex = shuffledIndices[currentWordIndex]
      const word = availableWords[actualIndex]
      console.log('🎲 Случайный порядок:', { actualIndex, word: word?.russian })
      return word
    }
    const word = availableWords[currentWordIndex]
    console.log('📝 Обычный порядок:', { word: word?.russian })
    return word
  }
  
  const currentWord = getCurrentWord()
  
  // Проверяем, является ли текущее слово последним
  const isLastWord = currentWordIndex === availableWords.length - 1
  
  // Загружаем прогресс при смене темы
  useEffect(() => {
    if (selectedTopicId) {
      const userId = 1; // Временно используем ID 1
      loadWordsProgress({ userId, topicId: selectedTopicId })
      loadTopicProgress({ userId, topicId: selectedTopicId })
    } else {
      // Загружаем рекомендованные слова и общий прогресс если нет выбранного топика
      const userId = 1; // Временно используем ID 1
      loadRecommendedWordsFx(userId)
      loadOverallProgress(userId)
      
      // Загружаем прогресс для всех слов в рекомендованном режиме
      // Это нужно для правильной фильтрации изученных слов
      loadWordsProgress({ userId, topicId: 'all' })
    }
  }, [selectedTopicId])

  // Обновляем прогресс при изменении индекса слова
  useEffect(() => {
    if (selectedTopicId) {
      const userId = 1; // Временно используем ID 1
      loadWordsProgress({ userId, topicId: selectedTopicId })
      loadTopicProgress({ userId, topicId: selectedTopicId })
    }
  }, [currentWordIndex, selectedTopicId])

  // Корректируем индекс при изменении списка доступных слов
  useEffect(() => {
    console.log('🔍 Проверка индекса:', { 
      currentWordIndex, 
      availableWordsLength: availableWords.length,
      availableWords: availableWords.map(w => w.russian)
    })
    
    if (availableWords.length === 0) {
      // Если нет доступных слов, ничего не делаем
      return
    }
    
    if (currentWordIndex >= availableWords.length) {
      console.log('🔄 Корректируем индекс слова, так как текущий индекс больше количества доступных слов')
      // Если текущий индекс больше количества слов, уменьшаем его на 1
      // Это происходит когда слово исчезло из списка
      const newIndex = Math.max(0, currentWordIndex - 1)
      setWordIndex(newIndex)
    }
  }, [availableWords.length, currentWordIndex, availableWords])

  // Сброс нажатых кнопок при изменении списка доступных слов (когда слово исчезло)
  useEffect(() => {
    console.log('🔄 Список доступных слов изменился, сбрасываем нажатые кнопки')
    setPressedButtons(new Set())
  }, [availableWords.length])

  // Сброс состояния при смене темы
  useEffect(() => {
    resetWordIndex()
    setIsFlipped(false)
    setIsRandomOrder(false)
    setShuffledIndices([])
    setIsTransitioning(false)
    setPressedButtons(new Set())
  }, [selectedTopicId])

  // Сброс нажатых кнопок при смене слова
  useEffect(() => {
    setPressedButtons(new Set())
  }, [currentWordIndex])

  // Сброс нажатых кнопок при смене текущего слова (когда слово действительно изменилось)
  useEffect(() => {
    if (currentWord) {
      console.log('🔄 Слово изменилось, сбрасываем нажатые кнопки:', currentWord.russian)
      setPressedButtons(new Set())
    }
  }, [currentWord?.id])

  // Управляем переходом при смене слова
  useLayoutEffect(() => {
    // Сбрасываем карточку при смене слова
    setIsFlipped(false)
    // Устанавливаем флаг перехода
    setIsTransitioning(true)
    // Сбрасываем флаг перехода после завершения анимации
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 170) // 300ms для завершения анимации переворота
    
    return () => clearTimeout(timer)
  }, [currentWordIndex])

  const handleBack = () => {
    setCurrentPage('dashboard')
  }

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    if (currentWordIndex < availableWords.length - 1) {
      // Сначала принудительно сбрасываем карточку
      setIsFlipped(false)
      // Затем меняем слово через Effector
      nextWord()
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      // Сначала принудительно сбрасываем карточку
      setIsFlipped(false)
      // Затем меняем слово через Effector
      previousWord()
    }
  }

  const handleReset = () => {
    // Сначала принудительно сбрасываем карточку
    setIsFlipped(false)
    // Затем сбрасываем индекс через Effector
    resetWordIndex()
  }

  const handleShuffle = () => {
    if (availableWords.length === 0) return
    
    // Создаем массив индексов и перемешиваем его с помощью алгоритма Fisher-Yates
    const indices = Array.from({ length: availableWords.length }, (_, i) => i)
    const shuffled = [...indices]
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    // Сначала принудительно сбрасываем карточку
    setIsFlipped(false)
    // Затем меняем состояние
    setShuffledIndices(shuffled)
    setIsRandomOrder(true)
    resetWordIndex()
    
    console.log('🔀 Слова перемешаны в случайном порядке:', shuffled)
  }

  const handleNormalOrder = () => {
    // Сначала принудительно сбрасываем карточку
    setIsFlipped(false)
    // Затем меняем состояние
    setIsRandomOrder(false)
    setShuffledIndices([])
    resetWordIndex()
    
    console.log('📝 Возвращен обычный порядок слов')
  }

  const handleMarkAsLearned = () => {
    if (currentWord) {
      const userId = 1; // Временно используем ID 1
      console.log('🎯 Нажата кнопка "Выучил" для слова:', currentWord.russian, 'ID:', currentWord.id)
      
      // Сразу блокируем кнопку
      setPressedButtons(prev => new Set([...prev, 'learned']))
      
      // Если карточка перевернута, переворачиваем её обратно
      if (isFlipped) {
        setIsFlipped(false)
      }
      
      markWordAsLearned({ userId, wordId: currentWord.id })
      console.log('✅ Слово отмечено как изученное:', currentWord.russian)
      
      // Если это режим рекомендованных слов, обновляем статус слова в store
      if (isRecommendedMode) {
        markRecommendedWordAsLearned(currentWord.id)
      }
      
      // Обновляем прогресс и переходим к следующему слову с небольшой задержкой
      setTimeout(() => {
        if (selectedTopicId) {
          loadWordsProgress({ userId, topicId: selectedTopicId })
          loadTopicProgress({ userId, topicId: selectedTopicId })
          // НЕ переходим к следующему слову - остаемся на той же позиции
          // Слово исчезнет из списка, и мы автоматически увидим следующее
        } else {
          // Если это режим рекомендованных слов, обновляем общий прогресс и рекомендованные слова
          loadOverallProgress(userId)
          
          // Перезагружаем рекомендованные слова с сервера для получения актуального списка
          loadRecommendedWordsFx(userId)
          // В режиме рекомендованных слов НЕ переходим к следующему слову
          // Слово исчезнет из списка, и мы автоматически увидим следующее
        }
      }, 200)
      
      // Показываем краткую анимацию успеха
      setIsTransitioning(true)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)
    }
  }


  const getCurrentWordProgress = () => {
    if (!currentWord) return null
    const progress = wordsProgress.find(p => p.word_id === currentWord.id)
    console.log('🔍 Прогресс текущего слова:', { wordId: currentWord.id, progress, allProgress: wordsProgress })
    return progress
  }

  // Проверяем, заблокирована ли кнопка "Выучил" (либо по прогрессу, либо по локальному состоянию)
  const isButtonPressed = (buttonType: 'learned') => {
    const progress = getCurrentWordProgress()
    const isPressedLocally = pressedButtons.has(buttonType)
    const isPressedInProgress = progress?.learned
    
    return isPressedLocally || isPressedInProgress
  }

  if (isLoading || isRecommendedLoading) {
    return (
      <WordCardContainer>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <ArrowLeft size={20} />
            </BackButton>
            <TopicInfo>
              <TopicIcon>{isRecommendedMode ? '🎯' : (selectedTopic?.icon || '📚')}</TopicIcon>
              <TopicName>{isRecommendedMode ? 'Рекомендованные слова' : (selectedTopic?.name || 'Загрузка...')}</TopicName>
            </TopicInfo>
          </HeaderContent>
        </Header>
        <LoadingSpinner text="Загрузка слов..." />
      </WordCardContainer>
    )
  }

  if (!selectedTopic && !isRecommendedMode) {
    return (
      <WordCardContainer>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <ArrowLeft size={20} />
            </BackButton>
            <TopicInfo>
              <TopicIcon>❌</TopicIcon>
              <TopicName>Топик не найден</TopicName>
            </TopicInfo>
          </HeaderContent>
        </Header>
      </WordCardContainer>
    )
  }

  // Показываем сообщение о завершении, если нет доступных слов
  if (availableWords.length === 0) {
    return (
      <WordCardContainer>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <ArrowLeft size={20} />
            </BackButton>
            <TopicInfo>
            <TopicIcon>{selectedTopic?.icon || '📚'}</TopicIcon>
            <TopicName>{selectedTopic?.name || 'Топик'}</TopicName>
            </TopicInfo>
          </HeaderContent>
        </Header>
        <CardSection>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#4CAF50', marginBottom: '1rem' }}>Поздравляем!</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Вы изучили все слова в теме "{selectedTopic?.name || 'топике'}"!
            </p>
            <button 
              onClick={handleBack}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Вернуться к темам
            </button>
          </div>
        </CardSection>
      </WordCardContainer>
    )
  }

  if (!currentWord) {
    return (
      <WordCardContainer>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <ArrowLeft size={20} />
            </BackButton>
            <TopicInfo>
            <TopicIcon>{selectedTopic?.icon || '📚'}</TopicIcon>
            <TopicName>{selectedTopic?.name || 'Топик'}</TopicName>
            </TopicInfo>
          </HeaderContent>
        </Header>
        <CardSection>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h2 style={{ color: '#666', marginBottom: '1rem' }}>Загрузка слова...</h2>
          </div>
        </CardSection>
      </WordCardContainer>
    )
  }

  return (
    <WordCardContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack} title="Вернуться к топикам">
            <ArrowLeft size={20} />
          </BackButton>
          <TopicInfo>
            <TopicIcon>{isRecommendedMode ? '🎯' : (selectedTopic?.icon || '📚')}</TopicIcon>
            <TopicName>
              {isRecommendedMode ? 'Рекомендованные слова' : (selectedTopic?.name || 'Топик')}
              {isRandomOrder && <span style={{ marginLeft: '8px', fontSize: '0.8em', opacity: 0.7 }}>🔀</span>}
            </TopicName>
          </TopicInfo>
        </HeaderContent>
      </Header>

      <CardSection>
        <WordCard $isFlipped={isFlipped} onClick={handleCardClick}>
          <CardInner $isFlipped={isFlipped}>
            <CardFront>
              {!isTransitioning ? (
                <>
                  <WordText>{currentWord.russian}</WordText>
                  <WordHint>нажмите, чтобы увидеть перевод</WordHint>
                </>
              ) : (
                <WordText style={{ opacity: 0.3 }}>...</WordText>
              )}
            </CardFront>
            <CardBack>
              {!isTransitioning ? (
                <>
                  <WordText>{currentWord.english}</WordText>
                  <WordHint>нажмите, чтобы вернуться</WordHint>
                  {currentWord.pronunciation && (
                    <WordDetails>
                      <Pronunciation>{currentWord.pronunciation}</Pronunciation>
                    </WordDetails>
                  )}
                  {currentWord.example_sentence && (
                    <WordDetails>
                      <ExampleSentence>"{currentWord.example_sentence}"</ExampleSentence>
                    </WordDetails>
                  )}
                </>
              ) : (
                <WordText style={{ opacity: 0.3 }}>...</WordText>
              )}
            </CardBack>
          </CardInner>
        </WordCard>
      </CardSection>

      {(currentTopicProgress || (isRecommendedMode && overallProgress)) && (
        <ProgressBarContainer>
          <ProgressBarHeader>
            <ProgressBarTitle>
              {isRecommendedMode ? 'Общий прогресс изучения' : 'Прогресс изучения'}
            </ProgressBarTitle>
            <ProgressBarStats>
              {isRecommendedMode && overallProgress ? (
                `${overallProgress.learned_words}/${overallProgress.total_words} изучено`
              ) : currentTopicProgress ? (
                `${currentTopicProgress.learned_words}/${currentTopicProgress.total_words} изучено`
              ) : (
                '0/0 изучено'
              )}
            </ProgressBarStats>
          </ProgressBarHeader>
          <ProgressBar>
            <ProgressBarFill 
              $percentage={
                isRecommendedMode && overallProgress 
                  ? overallProgress.progress_percentage 
                  : currentTopicProgress?.progress_percentage || 0
              } 
            />
          </ProgressBar>
          <ProgressBarPercentage>
            {isRecommendedMode && overallProgress 
              ? overallProgress.progress_percentage 
              : currentTopicProgress?.progress_percentage || 0}%
          </ProgressBarPercentage>
          {isRecommendedMode && overallProgress && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.9rem', 
              color: '#666',
              marginTop: '8px'
            }}>
              <span>🆕 Новых: {overallProgress.new_words}</span>
              <span>✅ Изучены: {overallProgress.learned_words}</span>
            </div>
          )}
          <LearningButtons>
            <LearningButton 
              $variant="learned" 
              onClick={handleMarkAsLearned}
              disabled={isButtonPressed('learned')}
            >
              <Check size={16} />
              Выучил
            </LearningButton>
          </LearningButtons>
        </ProgressBarContainer>
      )}

      <Controls>
        <ControlButton 
          onClick={handlePrevious} 
          disabled={currentWordIndex === 0}
          title="Предыдущее слово"
        >
          <ChevronLeft size={24} />
        </ControlButton>

        <ProgressInfo>
          <ProgressText>слово</ProgressText>
          <ProgressNumber>{currentWordIndex + 1} / {availableWords.length}</ProgressNumber>
          {isLastWord && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#4CAF50', 
              marginTop: '4px',
              fontWeight: 'bold'
            }}>
              Последнее слово!
            </div>
          )}
        </ProgressInfo>

        <ControlButton 
          onClick={isRandomOrder ? handleNormalOrder : handleShuffle}
          title={isRandomOrder ? "Обычный порядок" : "Случайный порядок"}
          $variant={isRandomOrder ? 'success' : 'default'}
        >
          <Shuffle size={20} />
        </ControlButton>

        <ControlButton 
          onClick={handleReset}
          title="Начать сначала"
        >
          <RotateCw size={20} />
        </ControlButton>

        <ControlButton 
          onClick={handleNext} 
          disabled={currentWordIndex === availableWords.length - 1}
          title="Следующее слово"
        >
          <ChevronRight size={24} />
        </ControlButton>
      </Controls>
    </WordCardContainer>
  )
}
