import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useUnit } from 'effector-react'
import { ArrowLeft, Trophy, BookOpen, Target, TrendingUp, Calendar, Award } from 'lucide-react'
import { $currentPage, setCurrentPage, $overallProgress, loadOverallProgress, setSelectedTopicId } from '../store/app'
import { loadWordsByTopicFx } from '../store/words'
import { $topicsProgress, loadTopicsProgress } from '../store/progress'

const StatisticsContainer = styled.div`
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
  padding: ${({ theme }) => theme.spacing.xl};
  flex-shrink: 0;

  ${({ theme }) => theme.media.mobile} {
    margin: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.dark};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
  }
`

const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin: 0;
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};
  
  ${({ theme }) => theme.media.mobile} {
    padding: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  }
`

const StatsSection = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: 4px;
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.sm} 0;
`

const ProgressBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  width: ${({ $percentage }) => $percentage}%;
  transition: width 0.3s ease;
`

const TopicList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const TopicItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: transform 0.1s ease;
  
  &:hover {
    cursor: pointer;
  }
  
  &:active {
    transform: scale(0.98);
  }
`

const TopicInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const TopicIcon = styled.div`
  font-size: 1.5rem;
`

const TopicName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.dark};
`

const TopicProgress = styled.div`
  text-align: right;
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
`

export const StatisticsScreen: React.FC = () => {
  const currentPage = useUnit($currentPage)
  const overallProgress = useUnit($overallProgress)
  const topicsProgress = useUnit($topicsProgress)

  useEffect(() => {
    const userId = 1
    loadOverallProgress(userId)
    loadTopicsProgress(userId)
  }, [])

  const handleBack = () => {
    setCurrentPage('dashboard')
  }

  const handleTopicClick = (topicId: string) => {
    console.log('🎯 Клик по топику в статистике:', topicId)
    setSelectedTopicId(topicId)
    loadWordsByTopicFx(topicId)
    setCurrentPage('wordCards')
  }

  // Подсчитываем количество завершенных топиков (100% прогресс)
  const completedTopicsCount = topicsProgress.filter(topic => topic.progress_percentage === 100).length

  if (currentPage !== 'statistics') {
    return null
  }

  return (
    <StatisticsContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <ArrowLeft size={20} />
          </BackButton>
          <HeaderTitle>Статистика</HeaderTitle>
        </HeaderContent>
      </Header>

      <Content>
        {/* Общая статистика */}
        <StatsSection>
          <SectionTitle>
            <Trophy size={24} />
            Общий прогресс
          </SectionTitle>
          
          {overallProgress && (
            <>
              <StatsGrid>
                <StatCard>
                  <StatIcon>📚</StatIcon>
                  <StatValue>{overallProgress.total_words}</StatValue>
                  <StatLabel>Всего слов</StatLabel>
                </StatCard>
                
                <StatCard>
                  <StatIcon>✅</StatIcon>
                  <StatValue>{overallProgress.learned_words}</StatValue>
                  <StatLabel>Изучено</StatLabel>
                </StatCard>
                
                <StatCard>
                  <StatIcon>🆕</StatIcon>
                  <StatValue>{overallProgress.new_words}</StatValue>
                  <StatLabel>Новых</StatLabel>
                </StatCard>
                
                <StatCard>
                  <StatIcon>📊</StatIcon>
                  <StatValue>{overallProgress.progress_percentage}%</StatValue>
                  <StatLabel>Прогресс</StatLabel>
                </StatCard>
              </StatsGrid>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>Общий прогресс</span>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {overallProgress.learned_words}/{overallProgress.total_words}
                  </span>
                </div>
                <ProgressBar>
                  <ProgressBarFill $percentage={overallProgress.progress_percentage} />
                </ProgressBar>
              </div>
            </>
          )}
        </StatsSection>

        {/* Прогресс по топикам */}
        <StatsSection>
          <SectionTitle>
            <BookOpen size={24} />
            Прогресс по топикам
          </SectionTitle>
          
          <TopicList>
            {topicsProgress.map((topic) => (
              <TopicItem 
                key={topic.topic_id} 
                onClick={() => handleTopicClick(topic.topic_id)}
                title={`Нажмите для изучения топика "${topic.topic_name}"`}
              >
                <TopicInfo>
                  <TopicIcon>📖</TopicIcon>
                  <TopicName>{topic.topic_name}</TopicName>
                </TopicInfo>
                <TopicProgress>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {topic.learned_words}/{topic.total_words}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {topic.progress_percentage}%
                  </div>
                </TopicProgress>
              </TopicItem>
            ))}
          </TopicList>
        </StatsSection>

        {/* Достижения */}
        <StatsSection>
          <SectionTitle>
            <Award size={24} />
            Достижения
          </SectionTitle>
          
          <StatsGrid>
            <StatCard>
              <StatIcon>🎯</StatIcon>
              <StatValue>1</StatValue>
              <StatLabel>Дней подряд</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>🔥</StatIcon>
              <StatValue>7</StatValue>
              <StatLabel>Серия изучения</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>⭐</StatIcon>
              <StatValue>{completedTopicsCount}</StatValue>
              <StatLabel>Топиков завершено</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>🏆</StatIcon>
              <StatValue>{overallProgress?.learned_words || 0}</StatValue>
              <StatLabel>Слов изучено</StatLabel>
            </StatCard>
          </StatsGrid>
        </StatsSection>
      </Content>
    </StatisticsContainer>
  )
}
