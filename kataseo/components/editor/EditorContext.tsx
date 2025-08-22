"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Block, EditorContextType, DEFAULT_BLOCKS } from '@/types/editor'

const EditorContext = createContext<EditorContextType | undefined>(undefined)

interface EditorProviderProps {
  children: ReactNode
  initialBlocks?: Block[]
  onChange?: (blocks: Block[]) => void
}

export function EditorProvider({ 
  children, 
  initialBlocks = DEFAULT_BLOCKS,
  onChange 
}: EditorProviderProps) {
  const [blocks, setBlocksState] = useState<Block[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  const setBlocks = (newBlocks: Block[]) => {
    setBlocksState(newBlocks)
    onChange?.(newBlocks)
  }

  const addBlock = (type: Block['type'], index?: number) => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: '',
      html: type === 'text' ? '<p></p>' : undefined,
      level: type === 'heading' ? 2 : undefined,
      language: type === 'code' ? 'javascript' : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const insertIndex = index ?? blocks.length
    const newBlocks = [...blocks]
    newBlocks.splice(insertIndex, 0, newBlock)
    setBlocks(newBlocks)
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(block => 
      block.id === id 
        ? { ...block, ...updates, updatedAt: new Date().toISOString() }
        : block
    )
    setBlocks(newBlocks)
  }

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return // Don't delete the last block
    
    const newBlocks = blocks.filter(block => block.id !== id)
    setBlocks(newBlocks)
    
    if (selectedBlockId === id) {
      setSelectedBlockId(null)
    }
  }

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id)
    if (!blockToDuplicate) return

    const newBlock: Block = {
      ...blockToDuplicate,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const index = blocks.findIndex(block => block.id === id)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    setBlocks(newBlocks)
  }

  const value: EditorContextType = {
    blocks,
    setBlocks,
    selectedBlockId,
    setSelectedBlockId,
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock
  }

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}

export { EditorContext }
