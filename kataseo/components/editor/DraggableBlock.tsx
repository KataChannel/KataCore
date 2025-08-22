"use client"

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'
import { 
  GripVertical, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Block } from '@/types/editor'
import { TextBlock } from './blocks/TextBlock'
import { HeadingBlock } from './blocks/HeadingBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { EmbedBlock } from './blocks/EmbedBlock'
import { CodeBlock } from './blocks/CodeBlock'
import { useEditor } from './EditorContext'
import { cn } from '@/lib/utils/cn'

interface DraggableBlockProps {
  block: Block
  index: number
  readOnly?: boolean
}

export function DraggableBlock({ block, index, readOnly = false }: DraggableBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { 
    blocks,
    selectedBlockId, 
    setSelectedBlockId, 
    updateBlock, 
    deleteBlock, 
    duplicateBlock, 
    addBlock 
  } = useEditor()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    disabled: readOnly
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isSelected = selectedBlockId === block.id
  const isFirst = index === 0
  const isLast = index === blocks.length - 1

  const handleSelect = () => {
    if (!readOnly) {
      setSelectedBlockId(isSelected ? null : block.id)
    }
  }

  const handleUpdate = (updates: Partial<Block>) => {
    updateBlock(block.id, updates)
  }

  const handleDelete = () => {
    deleteBlock(block.id)
  }

  const handleDuplicate = () => {
    duplicateBlock(block.id)
  }

  const handleAddBelow = (type: Block['type']) => {
    addBlock(type, index + 1)
  }

  const handleMoveUp = () => {
    if (!isFirst) {
      // Move up logic will be handled by drag and drop
      // This is for keyboard accessibility
    }
  }

  const handleMoveDown = () => {
    if (!isLast) {
      // Move down logic will be handled by drag and drop
      // This is for keyboard accessibility
    }
  }

  const renderBlockContent = () => {
    const commonProps = {
      block,
      onUpdate: handleUpdate,
      isSelected,
      readOnly
    }

    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} />
      case 'heading':
        return <HeadingBlock {...commonProps} />
      case 'image':
        return <ImageBlock {...commonProps} />
      case 'embed':
        return <EmbedBlock {...commonProps} />
      case 'code':
        return <CodeBlock {...commonProps} />
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            Unknown block type: {block.type}
          </div>
        )
    }
  }

  if (readOnly) {
    return (
      <div className="w-full">
        {renderBlockContent()}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all duration-200",
        isDragging && "opacity-50 scale-95",
        isSelected && "ring-2 ring-blue-500 ring-opacity-50 rounded-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* Drag handle and controls */}
      {(isHovered || isSelected) && (
        <div className="absolute left-0 top-0 -translate-x-full pr-2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Drag handle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 cursor-grab active:cursor-grabbing hover:bg-gray-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </Button>
          
          {/* Block menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => handleAddBelow('text')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Text Below
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleAddBelow('heading')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Heading Below
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {!isFirst && (
                <DropdownMenuItem onClick={handleMoveUp}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Move Up
                </DropdownMenuItem>
              )}
              
              {!isLast && (
                <DropdownMenuItem onClick={handleMoveDown}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Move Down
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Block content */}
      <div className="w-full">
        {renderBlockContent()}
      </div>

      {/* Add block below indicator */}
      {(isHovered || isSelected) && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full py-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full border-2 border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
              >
                <Plus className="h-3 w-3 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleAddBelow('text')}>
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBelow('heading')}>
                Heading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBelow('image')}>
                Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBelow('embed')}>
                Embed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBelow('code')}>
                Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
