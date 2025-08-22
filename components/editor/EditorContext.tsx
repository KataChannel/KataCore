'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Block, BlockEditorState, BlockEditorActions, EditorContextType } from '@/types/editor'

type EditorAction = 
  | { type: 'ADD_BLOCK'; blockType: Block['type']; index?: number }
  | { type: 'UPDATE_BLOCK'; id: string; content: any; metadata?: Block['metadata'] }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; fromIndex: number; toIndex: number }
  | { type: 'SELECT_BLOCK'; id: string }
  | { type: 'FOCUS_BLOCK'; id: string }
  | { type: 'DUPLICATE_BLOCK'; id: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_BLOCKS'; blocks: Block[] }
  | { type: 'SET_DRAGGING'; isDragging: boolean }

const EditorContext = createContext<EditorContextType | null>(null)

function generateBlockId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function createDefaultBlock(type: Block['type']): Block {
  const id = generateBlockId()
  
  switch (type) {
    case 'paragraph':
      return { id, type, content: { text: '' } }
    case 'heading':
      return { id, type, content: { text: '' }, metadata: { level: 1 } }
    case 'image':
      return { id, type, content: { url: '', alt: '' }, metadata: { caption: '' } }
    case 'quote':
      return { id, type, content: { text: '', author: '' } }
    case 'list':
      return { id, type, content: { items: [''], ordered: false } }
    case 'code':
      return { id, type, content: { code: '', language: 'javascript' } }
    case 'divider':
      return { id, type, content: {} }
    default:
      return { id, type: 'paragraph', content: { text: '' } }
  }
}

function editorReducer(state: BlockEditorState, action: EditorAction): BlockEditorState {
  switch (action.type) {
    case 'SET_BLOCKS':
      return { ...state, blocks: action.blocks }
    
    case 'ADD_BLOCK': {
      const newBlock = createDefaultBlock(action.blockType)
      const index = action.index ?? state.blocks.length
      const newBlocks = [...state.blocks]
      newBlocks.splice(index, 0, newBlock)
      
      return {
        ...state,
        blocks: newBlocks,
        selectedBlockId: newBlock.id,
        focusedBlockId: newBlock.id
      }
    }
    
    case 'UPDATE_BLOCK': {
      const blocks = state.blocks.map(block =>
        block.id === action.id
          ? { 
              ...block, 
              content: action.content,
              metadata: action.metadata || block.metadata
            }
          : block
      )
      return { ...state, blocks }
    }
    
    case 'DELETE_BLOCK': {
      const blocks = state.blocks.filter(block => block.id !== action.id)
      const wasSelected = state.selectedBlockId === action.id
      const wasFocused = state.focusedBlockId === action.id
      
      return {
        ...state,
        blocks,
        selectedBlockId: wasSelected ? null : state.selectedBlockId,
        focusedBlockId: wasFocused ? null : state.focusedBlockId
      }
    }
    
    case 'MOVE_BLOCK': {
      const blocks = [...state.blocks]
      const [movedBlock] = blocks.splice(action.fromIndex, 1)
      if (movedBlock) {
        blocks.splice(action.toIndex, 0, movedBlock)
      }
      
      return { ...state, blocks }
    }
    
    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.id }
    
    case 'FOCUS_BLOCK':
      return { ...state, focusedBlockId: action.id }
    
    case 'DUPLICATE_BLOCK': {
      const blockToDuplicate = state.blocks.find(b => b.id === action.id)
      if (!blockToDuplicate) return state
      
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: generateBlockId()
      }
      
      const index = state.blocks.findIndex(b => b.id === action.id)
      const newBlocks = [...state.blocks]
      newBlocks.splice(index + 1, 0, duplicatedBlock)
      
      return {
        ...state,
        blocks: newBlocks,
        selectedBlockId: duplicatedBlock.id
      }
    }
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedBlockId: null, focusedBlockId: null }
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.isDragging }
    
    default:
      return state
  }
}

interface EditorProviderProps {
  children: React.ReactNode
  initialBlocks?: Block[]
  config?: Partial<EditorContextType['config']>
}

export function EditorProvider({ children, initialBlocks = [], config = {} }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, {
    blocks: initialBlocks.length > 0 ? initialBlocks : [createDefaultBlock('paragraph')],
    selectedBlockId: null,
    isDragging: false,
    focusedBlockId: null
  })

  const actions: BlockEditorActions = {
    addBlock: (type, index) => dispatch({ type: 'ADD_BLOCK', blockType: type, index }),
    updateBlock: (id, content, metadata) => dispatch({ type: 'UPDATE_BLOCK', id, content, metadata }),
    deleteBlock: (id) => dispatch({ type: 'DELETE_BLOCK', id }),
    moveBlock: (fromIndex, toIndex) => dispatch({ type: 'MOVE_BLOCK', fromIndex, toIndex }),
    selectBlock: (id) => dispatch({ type: 'SELECT_BLOCK', id }),
    focusBlock: (id) => dispatch({ type: 'FOCUS_BLOCK', id }),
    duplicateBlock: (id) => dispatch({ type: 'DUPLICATE_BLOCK', id }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' })
  }

  const editorConfig: EditorContextType['config'] = {
    allowedBlocks: ['paragraph', 'heading', 'image', 'quote', 'list', 'code', 'divider'],
    enableDragDrop: true,
    enableKeyboardShortcuts: true,
    ...config
  }

  const contextValue: EditorContextType = {
    state,
    actions,
    config: editorConfig
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!editorConfig.enableKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Add new paragraph block
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        actions.addBlock('paragraph')
      }
      
      // Ctrl/Cmd + D: Duplicate current block
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.selectedBlockId) {
        e.preventDefault()
        actions.duplicateBlock(state.selectedBlockId)
      }
      
      // Delete: Remove current block
      if (e.key === 'Delete' && state.selectedBlockId && state.blocks.length > 1) {
        e.preventDefault()
        actions.deleteBlock(state.selectedBlockId)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [state.selectedBlockId, state.blocks.length, editorConfig.enableKeyboardShortcuts])

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}

export function useEditorActions() {
  const { actions } = useEditor()
  return actions
}

export function useEditorState() {
  const { state } = useEditor()
  return state
}
