import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: ${({ theme }) => theme.spacing.xxxl};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

  ${({ theme }) => theme.media.mobile} {
    padding: ${({ theme }) => theme.spacing.xl};
    max-width: 100%;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.dark};
  }
`

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const ModalDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.gray};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.5;
`

const UploadArea = styled.div<{ $isDragOver: boolean; $hasFile: boolean }>`
  border: 2px dashed ${({ $isDragOver, $hasFile, theme }) => 
    $hasFile ? theme.colors.success : $isDragOver ? theme.colors.primary : theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.xxxl};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $hasFile, theme }) => $hasFile ? theme.colors.lightSuccess : 'transparent'};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.lightPrimary};
  }
`

const UploadIcon = styled.div<{ $hasFile: boolean }>`
  color: ${({ $hasFile, theme }) => $hasFile ? theme.colors.success : theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const UploadText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const UploadSubtext = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const FileInput = styled.input`
  display: none;
`

const FileInfo = styled.div`
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const FileName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.dark};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`

const FileSize = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.gray};
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  ${({ $variant, theme }) => $variant === 'primary' ? `
    background: ${theme.colors.primary};
    color: white;
    border: none;

    &:hover {
      background: ${theme.colors.primaryDark};
    }

    &:disabled {
      background: ${theme.colors.gray};
      cursor: not-allowed;
    }
  ` : `
    background: transparent;
    color: ${theme.colors.gray};
    border: 1px solid ${theme.colors.lightGray};

    &:hover {
      background: ${theme.colors.lightGray};
      color: ${theme.colors.dark};
    }
  `}
`

const StatusMessage = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};

  ${({ $type, theme }) => {
    switch ($type) {
      case 'success':
        return `
          background: ${theme.colors.lightSuccess};
          color: ${theme.colors.success};
          border: 1px solid ${theme.colors.success};
        `
      case 'error':
        return `
          background: ${theme.colors.lightError};
          color: ${theme.colors.error};
          border: 1px solid ${theme.colors.error};
        `
      case 'info':
        return `
          background: ${theme.colors.lightPrimary};
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
        `
    }
  }}
`

interface ExcelImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File) => Promise<void>
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    )

    if (excelFile) {
      setSelectedFile(excelFile)
      setStatusMessage(null)
    } else {
      setStatusMessage({ type: 'error', text: 'Пожалуйста, выберите файл Excel (.xlsx или .xls)' })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setStatusMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setStatusMessage({ type: 'info', text: 'Загружаем файл...' })

    try {
      await onImport(selectedFile)
      setStatusMessage({ type: 'success', text: 'Топик успешно импортирован!' })
      setTimeout(() => {
        onClose()
        setSelectedFile(null)
        setStatusMessage(null)
      }, 2000)
    } catch (error) {
      setStatusMessage({ 
        type: 'error', 
        text: `Ошибка при импорте: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      onClose()
      setSelectedFile(null)
      setStatusMessage(null)
    }
  }

  if (!isOpen) return null

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} disabled={isUploading}>
          <X size={20} />
        </CloseButton>

        <ModalTitle>Импорт топика</ModalTitle>
        <ModalDescription>
          Выберите Excel файл с топиком и словами для добавления в приложение
        </ModalDescription>

        <UploadArea
          $isDragOver={isDragOver}
          $hasFile={!!selectedFile}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon $hasFile={!!selectedFile}>
            {selectedFile ? <CheckCircle size={48} /> : <Upload size={48} />}
          </UploadIcon>
          
          <UploadText>
            {selectedFile ? 'Файл выбран' : 'Перетащите файл сюда или нажмите для выбора'}
          </UploadText>
          
          <UploadSubtext>
            Поддерживаются файлы .xlsx и .xls
          </UploadSubtext>

          <FileInput
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
          />
        </UploadArea>

        {selectedFile && (
          <FileInfo>
            <FileSpreadsheet size={20} />
            <FileName>{selectedFile.name}</FileName>
            <FileSize>({(selectedFile.size / 1024).toFixed(1)} KB)</FileSize>
          </FileInfo>
        )}

        {statusMessage && (
          <StatusMessage $type={statusMessage.type}>
            {statusMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {statusMessage.text}
          </StatusMessage>
        )}

        <ButtonGroup>
          <Button $variant="secondary" onClick={handleClose} disabled={isUploading}>
            Отмена
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? <LoadingSpinner text="Импорт..." /> : 'Импортировать'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  )
}
