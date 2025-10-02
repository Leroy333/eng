import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useUnit } from 'effector-react'
import { $topics, $filteredTopics, $searchQuery, $recommendedWordsCount, Topic, loadTopicsFx, setSearchQuery, loadRecommendedWords } from '../store'
import { loadWordsByTopicFx } from '../store/words'
import { setCurrentPage, setSelectedTopicId } from '../store/app'
import { $topicsProgress, loadTopicsProgress } from '../store/progress'
import { $importModalOpen, setImportModalOpen, importTopicFromExcel } from '../store/import'
import { Search, ArrowRight, Home, BookOpen, Trophy, Settings, User } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { ExcelImportModal } from './ExcelImportModal'
import { AddTopicCardComponent } from './AddTopicCard'

const DashboardContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: ${({ theme }) => theme.colors.light};
  overflow: hidden;
`

const Header = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl} 0 ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  flex-shrink: 0;

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

const SearchBar = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`

const SearchIcon = styled(Search)`
  color: ${({ theme }) => theme.colors.gray};
  width: 20px;
  height: 20px;

  ${({ theme }) => theme.media.mobile} {
    width: 18px;
    height: 18px;
  }
`

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  flex: 1;
  font-size: ${({ theme }) => theme.fontSize.base};
  color: ${({ theme }) => theme.colors.dark};

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray};
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.sm};
  }
`

const ProgressCard = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xxxl};
  flex-shrink: 0;

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    margin: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`

const ProgressContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ProgressText = styled.div`
  color: ${({ theme }) => theme.colors.light};
`

const ProgressNumber = styled.div`
  font-size: ${({ theme }) => theme.fontSize.huge};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.xxxl};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 40px;
  }
`

const ProgressLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xl};
  opacity: 0.9;
  font-weight: ${({ theme }) => theme.fontWeight.normal};

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.lg};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSize.xl};
  }
`

const ProgressArrow = styled.div`
  width: 45px;
  height: 45px;
  background: ${({ theme }) => theme.colors.light};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.dark};
  cursor: pointer;

  ${({ theme }) => theme.media.mobile} {
    width: 40px;
    height: 40px;
  }
`

const TopicsSection = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: 0 ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xxxl};
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  ${({ theme }) => theme.media.mobile} {
    margin: 0 ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    margin: 0 ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`

const TopicsTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-transform: lowercase;
  letter-spacing: -0.3px;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.xl};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSize.xxl};
  }
`

const TopicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  }

  ${({ theme }) => theme.media.tablet} {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.desktop} {
    grid-template-columns: repeat(4, 1fr);
  }
`

const TopicItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 100px;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGray};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm};
    min-height: 80px;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
    min-height: 90px;
  }
`

const TopicIcon = styled.div`
  font-size: 28px;

  ${({ theme }) => theme.media.mobile} {
    font-size: 24px;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 26px;
  }
`

const TopicName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.dark};
  text-transform: lowercase;
  font-weight: ${({ theme }) => theme.fontWeight.medium};

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.sm};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSize.md};
  }
`

const TopicWordsCount = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
  opacity: 0.8;
`

const TopicProgressContainer = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const TopicProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const TopicProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  width: ${({ $percentage }) => $percentage}%;
  transition: width 0.3s ease;
`

const TopicProgressText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
`

const NoResultsMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.gray};
  font-size: ${({ theme }) => theme.fontSize.lg};
`

const BottomNav = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-shrink: 0;

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${({ theme }) => theme.media.tablet} {
    margin: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const NavItem = styled.div<{ $active?: boolean }>`
  color: ${({ $active, theme }) => $active ? theme.colors.dark : theme.colors.gray};
  cursor: pointer;
  transition: all 0.2s;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 50%;
  background: ${({ $active, theme }) => $active ? theme.colors.light : 'transparent'};

  &:hover {
    color: ${({ theme }) => theme.colors.gray};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.xs};
  }
`

export const DashboardScreen: React.FC = () => {
  const newWordsCount = useUnit($recommendedWordsCount)
  const topics = useUnit($topics)
  const filteredTopics = useUnit($filteredTopics)
  const searchQuery = useUnit($searchQuery)
  const topicsProgress = useUnit($topicsProgress)
  const isLoading = useUnit(loadTopicsFx.pending)
  const importModalOpen = useUnit($importModalOpen)

  console.log('📊 DashboardScreen render:', { topics: topics.length, isLoading, topicsProgress: topicsProgress.length })

  // Загружаем прогресс для всех тем при монтировании компонента
  useEffect(() => {
    const userId = 1; // Временно используем ID 1, позже можно будет получать из контекста
    console.log('🔄 Загружаем прогресс для пользователя:', userId)
    loadTopicsProgress(userId)
    loadRecommendedWords(userId)
  }, [])

  const handleTopicClick = (topicId: string) => {
    console.log('🎯 Клик по теме:', topicId)
    setSelectedTopicId(topicId)
    loadWordsByTopicFx(topicId)
    setCurrentPage('wordCards')
  }

  const handleAddTopicClick = () => {
    console.log('➕ Открываем модальное окно импорта')
    setImportModalOpen(true)
  }

  const handleImportFile = async (file: File) => {
    console.log('📁 Импортируем файл:', file.name)
    await importTopicFromExcel(file)
    // Список топиков обновится автоматически через store
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    console.log('🔍 Поисковый запрос:', query)
    setSearchQuery(query)
  }

  const handleRecommendedWordsClick = () => {
    console.log('🎯 Переходим к рекомендованным словам')
    setSelectedTopicId(null) // Сбрасываем выбранный топик для смешанных карточек
    setCurrentPage('wordCards')
  }

  // Функция для получения прогресса конкретной темы
  const getTopicProgress = (topicId: string) => {
    const progress = topicsProgress.find(progress => progress.topic_id === topicId)
    console.log(`📈 Прогресс для темы ${topicId}:`, progress)
    return progress
  }

  if (isLoading) {
    console.log('⏳ Показываем индикатор загрузки...')
    return (
      <DashboardContainer>
        <LoadingSpinner text="Загрузка тем..." />
      </DashboardContainer>
    )
  }

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <SearchBar>
            <SearchIcon size={20} />
            <SearchInput 
              type="text" 
              placeholder="Найти топик..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </SearchBar>
        </HeaderContent>
      </Header>

      <ProgressCard>
        <ProgressContent>
          <ProgressText>
            <ProgressNumber>{newWordsCount}</ProgressNumber>
            <ProgressLabel>новых слов для изучения</ProgressLabel>
          </ProgressText>
          <ProgressArrow onClick={handleRecommendedWordsClick}>
            <ArrowRight size={20} />
          </ProgressArrow>
        </ProgressContent>
      </ProgressCard>

      <TopicsSection>
        <TopicsTitle>Учи слова из топиков:</TopicsTitle>
        <TopicsGrid>
          {filteredTopics.length > 0 ? (
            <>
              {filteredTopics.map((topic: Topic) => {
                const progress = getTopicProgress(topic.id)
                return (
                  <TopicItem key={topic.id} onClick={() => handleTopicClick(topic.id)}>
                    <TopicIcon>{topic.icon}</TopicIcon>
                    <TopicName>{topic.name}</TopicName>
                    {topic.words_count && (
                      <TopicWordsCount>{topic.words_count} слов</TopicWordsCount>
                    )}
                    {progress && (
                      <TopicProgressContainer>
                        <TopicProgressBar>
                          <TopicProgressFill $percentage={progress.progress_percentage} />
                        </TopicProgressBar>
                        <TopicProgressText>
                          {progress.learned_words}/{progress.total_words} изучено
                        </TopicProgressText>
                      </TopicProgressContainer>
                    )}
                  </TopicItem>
                )
              })}
              <AddTopicCardComponent onClick={handleAddTopicClick} />
            </>
          ) : (
            <NoResultsMessage>
              {searchQuery ? `Топики по запросу "${searchQuery}" не найдены` : 'Топики не найдены'}
            </NoResultsMessage>
          )}
        </TopicsGrid>
      </TopicsSection>

      <BottomNav>
        <NavItem $active>
          <Home size={24} />
        </NavItem>
        <NavItem>
          <BookOpen size={24} />
        </NavItem>
        <NavItem onClick={() => setCurrentPage('statistics')}>
          <Trophy size={24} />
        </NavItem>
        <NavItem>
          <Settings size={24} />
        </NavItem>
        <NavItem>
          <User size={24} />
        </NavItem>
      </BottomNav>

      <ExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportFile}
      />
    </DashboardContainer>
  )
}