'use client'

import React, { useState, useCallback } from 'react'
import { useEditor } from './EditorContext'
import { BlockComponentProps, MediaFile } from '@/types/editor'
import { ParagraphBlock, HeadingBlock, ImageBlock, QuoteBlock, DividerBlock } from './BlockComponents'
import { MediaLibrary } from './MediaLibrary'
import { Button } from '@/components/ui/button'
import { Plus, Type, Heading1, Image, Quote, Minus } from 'lucide-react'

interface BlockEditorProps {
  onChange?: (blocks: any[]) => void
  onSave?: (blocks: any[]) => void
  readonly?: boolean
  className?: string
}

export function BlockEditor({ onChange, onSave, readonly = false, className = '' }: BlockEditorProps) {
  const { state, actions, config } = useEditor()
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [currentImageBlockId, setCurrentImageBlockId] = useState<string | null>(null)
  const [showBlockMenu, setShowBlockMenu] = useState<number | null>(null)

  // Notify parent of changes
  React.useEffect(() => {
    if (onChange) {
      onChange(state.blocks)
    }
  }, [state.blocks, onChange])

  const handleBlockClick = useCallback((blockId: string) => {
    actions.selectBlock(blockId)
  }, [actions])

  const handleAddBlock = useCallback((type: BlockComponentProps['block']['type'], index?: number) => {
    actions.addBlock(type, index)
    setShowBlockMenu(null)
  }, [actions])

  const handleImageSelect = useCallback((media: MediaFile | MediaFile[]) => {
    if (currentImageBlockId && !Array.isArray(media)) {
      actions.updateBlock(currentImageBlockId, {
        url: media.url,
        alt: media.altText || media.originalName
      })
    }
    setShowMediaLibrary(false)
    setCurrentImageBlockId(null)
  }, [currentImageBlockId, actions])

  const openMediaLibrary = useCallback((blockId: string) => {
    setCurrentImageBlockId(blockId)
    setShowMediaLibrary(true)
  }, [])

  const renderBlock = useCallback((block: BlockComponentProps['block'], index: number) => {
    const isSelected = state.selectedBlockId === block.id
    const isFocused = state.focusedBlockId === block.id
    
    const commonProps = {
      block,
      isSelected,
      isFocused,
      onUpdate: (content: any, metadata?: any) => actions.updateBlock(block.id, content, metadata),
      onDelete: () => actions.deleteBlock(block.id),
      onDuplicate: () => actions.duplicateBlock(block.id),
      onMoveUp: index > 0 ? () => actions.moveBlock(index, index - 1) : undefined,
      onMoveDown: index < state.blocks.length - 1 ? () => actions.moveBlock(index, index + 1) : undefined,
      readonly
    }

    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock {...commonProps} block={block as any} />
      
      case 'heading':
        return <HeadingBlock {...commonProps} block={block as any} />
      
      case 'image':
        return (
          <ImageBlock 
            {...commonProps} 
            block={block as any}
            onOpenMediaLibrary={() => openMediaLibrary(block.id)}
          />
        )
      
      case 'quote':
        return <QuoteBlock {...commonProps} block={block as any} />
      
      case 'divider':
        return <DividerBlock {...commonProps} block={block as any} />
      
      default:
        return <ParagraphBlock {...commonProps} block={block as any} />
    }
  }, [state.selectedBlockId, state.focusedBlockId, state.blocks.length, actions, readonly, openMediaLibrary])

  const blockMenuItems = [
    { type: 'paragraph' as const, icon: Type, label: 'Paragraph' },
    { type: 'heading' as const, icon: Heading1, label: 'Heading' },
    { type: 'image' as const, icon: Image, label: 'Image' },
    { type: 'quote' as const, icon: Quote, label: 'Quote' },
    { type: 'divider' as const, icon: Minus, label: 'Divider' }
  ].filter(item => config.allowedBlocks.includes(item.type))

  return (
    <div className={`max-w-4xl mx-auto p-4 ${className}`}>
      {/* Editor Toolbar */}
      {!readonly && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock('paragraph')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Block
            </Button>
            
            {onSave && (
              <Button onClick={() => onSave(state.blocks)}>
                Save
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {state.blocks.length} block{state.blocks.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="space-y-4">
        <div>
          {state.blocks.map((block, index) => (
            <div key={block.id} className="mb-4" onClick={() => handleBlockClick(block.id)}>
              {renderBlock(block, index)}
              
              {/* Add Block Button */}
              {!readonly && (
                <div className="relative">
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full w-8 h-8 p-0 bg-white border-2 border-gray-300 hover:border-blue-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowBlockMenu(showBlockMenu === index + 1 ? null : index + 1)
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      {showBlockMenu === index + 1 && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border rounded-lg shadow-lg p-2 min-w-[200px] z-20">
                          {blockMenuItems.map((item) => (
                            <button
                              key={item.type}
                              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded"
                              onClick={() => handleAddBlock(item.type, index + 1)}
                            >
                              <item.icon className="w-4 h-4" />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {state.blocks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">No blocks yet</p>
            {!readonly && (
              <Button onClick={() => handleAddBlock('paragraph')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Block
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => {
          setShowMediaLibrary(false)
          setCurrentImageBlockId(null)
        }}
        onSelect={handleImageSelect}
        accept={['image/*']}
      />
    </div>
  )
}
