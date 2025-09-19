import React, { useState, useEffect, useLayoutEffect } from 'react'
import styled from 'styled-components'
import { useUnit } from 'effector-react'
import { $words, loadWordsByTopicFx } from '../store/words'
import { $topics } from '../store/topics'
import { $selectedTopicId, setCurrentPage } from '../store/app'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, Shuffle } from 'lucide-react'
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

export const WordCardScreen: React.FC = () => {
  const words = useUnit($words)
  const topics = useUnit($topics)
  const selectedTopicId = useUnit($selectedTopicId)
  const isLoading = useUnit(loadWordsByTopicFx.pending)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRandomOrder, setIsRandomOrder] = useState(false)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const selectedTopic = topics.find(topic => topic.id === selectedTopicId)
  const topicWords = words.filter(word => word.topic_id === selectedTopicId)
  
  // Получаем текущее слово с учетом случайного порядка
  const getCurrentWord = () => {
    if (isRandomOrder && shuffledIndices.length > 0) {
      const actualIndex = shuffledIndices[currentWordIndex]
      return topicWords[actualIndex]
    }
    return topicWords[currentWordIndex]
  }
  
  const currentWord = getCurrentWord()

  // Сброс состояния при смене темы
  useEffect(() => {
    setCurrentWordIndex(0)
    setIsFlipped(false)
    setIsRandomOrder(false)
    setShuffledIndices([])
    setIsTransitioning(false)
  }, [selectedTopicId])

  // Управляем переходом при смене слова
  useLayoutEffect(() => {
    if (isFlipped) {
      setIsFlipped(false)
    }
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
    if (currentWordIndex < topicWords.length - 1) {

      // Сначала принудительно сбрасываем карточку
      setIsFlipped(false)
      // Затем меняем слово
      setCurrentWordIndex(currentWordIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      // Сначала принудительно сбрасываем карточку
      setIsFlipped(false)
      // Затем меняем слово
      setCurrentWordIndex(currentWordIndex - 1)
    }
  }

  const handleReset = () => {
    // Сначала принудительно сбрасываем карточку
    setIsFlipped(false)
    // Затем меняем слово
    setCurrentWordIndex(0)
  }

  const handleShuffle = () => {
    if (topicWords.length === 0) return
    
    // Создаем массив индексов и перемешиваем его с помощью алгоритма Fisher-Yates
    const indices = Array.from({ length: topicWords.length }, (_, i) => i)
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
    setCurrentWordIndex(0)
    
    console.log('🔀 Слова перемешаны в случайном порядке:', shuffled)
  }

  const handleNormalOrder = () => {
    // Сначала принудительно сбрасываем карточку
    setIsFlipped(false)
    // Затем меняем состояние
    setIsRandomOrder(false)
    setShuffledIndices([])
    setCurrentWordIndex(0)
    
    console.log('📝 Возвращен обычный порядок слов')
  }

  if (isLoading) {
    return (
      <WordCardContainer>
        <Header>
          <HeaderContent>
            <BackButton onClick={handleBack}>
              <ArrowLeft size={20} />
            </BackButton>
            <TopicInfo>
              <TopicIcon>{selectedTopic?.icon || '📚'}</TopicIcon>
              <TopicName>{selectedTopic?.name || 'Загрузка...'}</TopicName>
            </TopicInfo>
          </HeaderContent>
        </Header>
        <LoadingSpinner text="Загрузка слов..." />
      </WordCardContainer>
    )
  }

  if (!selectedTopic || !currentWord) {
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

  return (
    <WordCardContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack} title="Вернуться к топикам">
            <ArrowLeft size={20} />
          </BackButton>
          <TopicInfo>
            <TopicIcon>{selectedTopic.icon}</TopicIcon>
            <TopicName>
              {selectedTopic.name}
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
          <ProgressNumber>{currentWordIndex + 1} / {topicWords.length}</ProgressNumber>
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
          disabled={currentWordIndex === topicWords.length - 1}
          title="Следующее слово"
        >
          <ChevronRight size={24} />
        </ControlButton>
      </Controls>
    </WordCardContainer>
  )
}
