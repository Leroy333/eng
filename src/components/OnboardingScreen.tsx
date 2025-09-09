import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useUnit } from 'effector-react'
import { $currentPage } from '../store/app'

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const bounceIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const fallDown = keyframes`
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`

const expandAllSides = keyframes`
  0% {
    width: calc(40% - 10px);
    height: calc(30% - 10px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  100% {
    width: calc(80% - 20px);
    height: calc(60% - 20px);
    top: 10px;
    left: 10px;
    transform: translate(0, 0);
  }
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  position: relative;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing.xxxl};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`

const EmojiCollage = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  padding: ${({ theme }) => theme.spacing.xxxl};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(40% - 10px);
  height: calc(30% - 10px);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transform: translate(-50%, -50%);
  animation: ${expandAllSides} 1s ease-out 0.5s forwards;

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.xxl};
  }
`

const Emoji = styled.div<{ delay: number }>`
  font-size: ${({ theme }) => theme.fontSize.xxxl};
  margin: ${({ theme }) => theme.spacing.sm};
  animation: ${fallDown} 0.8s ease-out ${({ delay }) => delay}s forwards;
  opacity: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.xxl};
    margin: ${({ theme }) => theme.spacing.xs};
  }
`

const Content = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.xxxl};
  left: ${({ theme }) => theme.spacing.xxxl};
  right: ${({ theme }) => theme.spacing.xxxl};
  animation: ${slideUp} 1s ease-out 1.5s forwards;
  transform: translateY(100%);
  opacity: 0;

  ${({ theme }) => theme.media.mobile} {
    bottom: ${({ theme }) => theme.spacing.xl};
    left: ${({ theme }) => theme.spacing.xl};
    right: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    bottom: ${({ theme }) => theme.spacing.xxl};
    left: ${({ theme }) => theme.spacing.xxl};
    right: ${({ theme }) => theme.spacing.xxl};
  }
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.huge};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeInScale} 0.8s ease-out 2s forwards;
  opacity: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.xxxl};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 40px;
  }
`

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSize.lg};
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: ${({ theme }) => theme.spacing.xxxl};
  line-height: 1.5;
  animation: ${fadeIn} 0.8s ease-out 2.2s forwards;
  opacity: 0;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.base};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSize.xl};
  }
`

const StartButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xxxl};
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${bounceIn} 0.8s ease-out 2.4s forwards;
  opacity: 0;

  &:hover {
    background: #2E5AFF;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.fontSize.base};
  }

  ${({ theme }) => theme.media.tablet} {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xxl};
  }
`

const emojis = ['🎧', '🎬', '🚂', '🐕', '🎮', '☁️']

export const OnboardingScreen: React.FC = () => {
  const currentPage = useUnit($currentPage)

  const handleStart = () => {
    // Логика перехода к дашборду
    console.log('Starting learning!')
  }

  return (
    <Container>
      <EmojiCollage>
        {emojis.map((emoji, index) => (
          <Emoji key={index} delay={0.7 + index * 0.1}>
            {emoji}
          </Emoji>
        ))}
      </EmojiCollage>
      
      <Content>
        <Title>Изучай английский с удовольствием!</Title>
        <Description>
          Выбери интересную тему и начни изучать новые слова. 
          Каждое слово сопровождается примерами и произношением.
        </Description>
        <StartButton onClick={handleStart}>
          Начать изучение
        </StartButton>
      </Content>
    </Container>
  )
}
