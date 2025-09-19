import React from 'react'
import styled from 'styled-components'
import { useUnit } from 'effector-react'
import { $newWordsCount, $topics, Topic, loadTopicsFx } from '../store'
import { loadWordsByTopicFx } from '../store/words'
import { setCurrentPage, setSelectedTopicId } from '../store/app'
import { Search, ArrowRight, Home, BookOpen, Trophy, Settings, User } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

const DashboardContainer = styled.div`
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
  padding: ${({ theme }) => theme.spacing.xxl};

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

const BottomNav = styled.div`
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
  const newWordsCount = useUnit($newWordsCount)
  const topics = useUnit($topics)
  const isLoading = useUnit(loadTopicsFx.pending)

  console.log('📊 DashboardScreen render:', { topics: topics.length, isLoading })

  const handleTopicClick = (topicId: string) => {
    console.log('🎯 Клик по теме:', topicId)
    setSelectedTopicId(topicId)
    loadWordsByTopicFx(topicId)
    setCurrentPage('wordCards')
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
            <SearchInput type="text" placeholder="Find any topic" />
          </SearchBar>
        </HeaderContent>
      </Header>

      <ProgressCard>
        <ProgressContent>
          <ProgressText>
            <ProgressNumber>{newWordsCount}</ProgressNumber>
            <ProgressLabel>new words to learn</ProgressLabel>
          </ProgressText>
          <ProgressArrow>
            <ArrowRight size={20} />
          </ProgressArrow>
        </ProgressContent>
      </ProgressCard>

      <TopicsSection>
        <TopicsTitle>learn words by topic</TopicsTitle>
        <TopicsGrid>
          {topics.map((topic: Topic) => (
            <TopicItem key={topic.id} onClick={() => handleTopicClick(topic.id)}>
              <TopicIcon>{topic.icon}</TopicIcon>
              <TopicName>{topic.name}</TopicName>
              {topic.words_count && (
                <TopicWordsCount>{topic.words_count} слов</TopicWordsCount>
              )}
            </TopicItem>
          ))}
        </TopicsGrid>
      </TopicsSection>

      <BottomNav>
        <NavItem $active>
          <Home size={24} />
        </NavItem>
        <NavItem>
          <BookOpen size={24} />
        </NavItem>
        <NavItem>
          <Trophy size={24} />
        </NavItem>
        <NavItem>
          <Settings size={24} />
        </NavItem>
        <NavItem>
          <User size={24} />
        </NavItem>
      </BottomNav>
    </DashboardContainer>
  )
}