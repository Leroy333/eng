import React from 'react'
import styled from 'styled-components'
import { Plus } from 'lucide-react'

const AddTopicCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.white};
  border: 2px dashed ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s;
  min-height: 100px;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.lightPrimary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
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

const AddIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.lightPrimary};
  transition: all 0.2s;

  ${AddTopicCard}:hover & {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.1);
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 26px;
    width: 44px;
    height: 44px;
  }
`

const AddText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.dark};
  text-transform: lowercase;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  text-align: center;

  ${({ theme }) => theme.media.mobile} {
    font-size: ${({ theme }) => theme.fontSize.sm};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: ${({ theme }) => theme.fontSize.md};
  }
`

const AddSubtext = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  opacity: 0.8;
`

interface AddTopicCardProps {
  onClick: () => void
}

export const AddTopicCardComponent: React.FC<AddTopicCardProps> = ({ onClick }) => {
  return (
    <AddTopicCard onClick={onClick}>
      <AddIcon>
        <Plus size={24} />
      </AddIcon>
      <AddText>Добавить топик</AddText>
      <AddSubtext>Excel файл</AddSubtext>
    </AddTopicCard>
  )
}
