"use client"

import React, { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Block, BlockEditorProps } from '@/types/editor'
import { EditorProvider, useEditor } from './EditorContext'
import { DraggableBlock } from './DraggableBlock'
import { BlockToolbar } from './BlockToolbar'
import { PreviewPane, FloatingPreviewToggle } from './PreviewPane'
import { Button } from '@/components/ui/Button'
import { 
  Eye, 
  Save, 
  Undo, 
  Redo,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EditorControlsProps {
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
}

function EditorControls({ 
  onSave, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false,
  isSaving = false
}: EditorControlsProps) {
  return (
    <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* Save */}
        {onSave && (
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function EditorCore({ 
  showPreview, 
  setShowPreview, 
  readOnly = false,
  onSave,
  isSaving = false
}: {
  showPreview: boolean
  setShowPreview: (show: boolean) => void
  readOnly?: boolean
  onSave?: () => void
  isSaving?: boolean
}) {
  const { blocks, moveBlock } = useEditor()
  const [history] = useState<Block[][]>([blocks])
  // setHistory removed to avoid unused variable warning
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id)
      const newIndex = blocks.findIndex(block => block.id === over?.id)

      moveBlock(oldIndex, newIndex)
    }
  }

  // History management (currently not used, but kept for future implementation)
  // const saveToHistory = (newBlocks: Block[]) => {
  //   const newHistory = history.slice(0, historyIndex + 1)
  //   newHistory.push(newBlocks)
  //   setHistory(newHistory)
  //   setHistoryIndex(newHistory.length - 1)
  // }

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      // Apply the previous state
    }
  }, [historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      // Apply the next state
    }
  }, [historyIndex, history.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !readOnly) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 's':
            e.preventDefault()
            onSave?.()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [historyIndex, readOnly, onSave, undo, redo])

  if (readOnly) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {blocks.map((block, index) => (
            <DraggableBlock
              key={block.id}
              block={block}
              index={index}
              readOnly={true}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex h-full",
      isFullscreen && "fixed inset-0 z-50 bg-white"
    )}>
      {/* Editor pane */}
      <div className={cn(
        "flex-1 flex flex-col",
        showPreview ? "w-1/2" : "w-full"
      )}>
        {/* Controls */}
        <EditorControls
          onSave={onSave}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          isSaving={isSaving}
        />

        {/* Editor content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Add block at top */}
            <BlockToolbar />
            
            {/* Blocks */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext 
                items={blocks.map(b => b.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6 mt-6">
                  {blocks.map((block, index) => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      index={index}
                      readOnly={false}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            {/* Add block at bottom */}
            {blocks.length > 0 && (
              <div className="mt-8">
                <BlockToolbar />
              </div>
            )}
            
            {/* Empty state */}
            {blocks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <h3 className="text-lg font-medium mb-2">Start creating content</h3>
                <p className="mb-4">Add your first block to begin writing</p>
                <BlockToolbar />
              </div>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Preview pane */}
      <PreviewPane
        blocks={blocks}
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
      />

      {/* Mobile preview toggle */}
      <FloatingPreviewToggle
        isVisible={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
      />
    </div>
  )
}

export function BlockEditor({ 
  blocks, 
  onChange, 
  readOnly = false, 
  showPreview = true,
  onSave,
  isSaving = false
}: BlockEditorProps & {
  showPreview?: boolean
  onSave?: () => void
  isSaving?: boolean
}) {
  const [previewVisible, setPreviewVisible] = useState(showPreview)

  return (
    <EditorProvider initialBlocks={blocks} onChange={onChange}>
      <div className="h-full min-h-[600px] bg-white rounded-lg border border-gray-200 overflow-hidden">
        <EditorCore
          showPreview={previewVisible}
          setShowPreview={setPreviewVisible}
          readOnly={readOnly}
          onSave={onSave}
          isSaving={isSaving}
        />
      </div>
    </EditorProvider>
  )
}
