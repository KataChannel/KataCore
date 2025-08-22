'use client'

import React from 'react'
import { BlockComponentProps } from '@/types/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MoreVertical, Trash2, Copy, MoveUp, MoveDown, Image } from 'lucide-react'

interface ParagraphBlockProps extends BlockComponentProps {
  block: BlockComponentProps['block'] & {
    type: 'paragraph'
    content: { text: string }
  }
}

export function ParagraphBlock({ 
  block, 
  isSelected, 
  isFocused,
  onUpdate, 
  onDelete, 
  onDuplicate,
  onMoveUp,
  onMoveDown,
  readonly = false 
}: ParagraphBlockProps) {
  const handleTextChange = (text: string) => {
    onUpdate({ text })
  }

  return (
    <div className={`relative group border rounded-lg p-4 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {!readonly && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button variant="ghost" size="sm" onClick={onMoveUp}>
                <MoveUp className="w-3 h-3" />
              </Button>
            )}
            {onMoveDown && (
              <Button variant="ghost" size="sm" onClick={onMoveDown}>
                <MoveDown className="w-3 h-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      
      <Textarea
        value={block.content.text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Write your paragraph here..."
        className="border-none p-0 resize-none focus:ring-0 focus:outline-none"
        rows={Math.max(2, Math.ceil(block.content.text.length / 80))}
        readOnly={readonly}
      />
    </div>
  )
}

interface HeadingBlockProps extends BlockComponentProps {
  block: BlockComponentProps['block'] & {
    type: 'heading'
    content: { text: string }
    metadata: { level: 1 | 2 | 3 | 4 | 5 | 6 }
  }
}

export function HeadingBlock({ 
  block, 
  isSelected, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  readonly = false 
}: HeadingBlockProps) {
  const handleTextChange = (text: string) => {
    onUpdate({ text }, block.metadata)
  }

  const handleLevelChange = (level: number) => {
    onUpdate(block.content, { ...block.metadata, level: level as 1 | 2 | 3 | 4 | 5 | 6 })
  }

  const getHeadingClassName = (level: number) => {
    const sizes = {
      1: 'text-3xl font-bold',
      2: 'text-2xl font-bold', 
      3: 'text-xl font-bold',
      4: 'text-lg font-bold',
      5: 'text-base font-bold',
      6: 'text-sm font-bold'
    }
    return sizes[level as keyof typeof sizes] || sizes[1]
  }

  return (
    <div className={`relative group border rounded-lg p-4 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {!readonly && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <select
              value={block.metadata?.level || 1}
              onChange={(e) => handleLevelChange(Number(e.target.value))}
              className="text-xs border rounded px-2 py-1"
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>H{level}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      
      <Input
        value={block.content.text}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={`Heading ${block.metadata?.level || 1}`}
        className={`border-none p-0 focus:ring-0 focus:outline-none ${getHeadingClassName(block.metadata?.level || 1)}`}
        readOnly={readonly}
      />
    </div>
  )
}

interface ImageBlockProps extends BlockComponentProps {
  block: BlockComponentProps['block'] & {
    type: 'image'
    content: { url: string; alt: string }
    metadata?: { caption?: string }
  }
  onOpenMediaLibrary?: () => void
}

export function ImageBlock({ 
  block, 
  isSelected, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  onOpenMediaLibrary,
  readonly = false 
}: ImageBlockProps) {
  const handleImageSelect = () => {
    if (onOpenMediaLibrary) {
      onOpenMediaLibrary()
    }
  }

  const handleAltChange = (alt: string) => {
    onUpdate({ ...block.content, alt }, block.metadata)
  }

  const handleCaptionChange = (caption: string) => {
    onUpdate(block.content, { ...block.metadata, caption })
  }

  return (
    <div className={`relative group border rounded-lg p-4 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {!readonly && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      
      {block.content.url ? (
        <div className="space-y-3">
          <img
            src={block.content.url}
            alt={block.content.alt}
            className="w-full rounded-lg cursor-pointer"
            onClick={!readonly ? handleImageSelect : undefined}
          />
          
          {!readonly && (
            <>
              <Input
                value={block.content.alt}
                onChange={(e) => handleAltChange(e.target.value)}
                placeholder="Alt text for accessibility..."
                className="text-sm"
              />
              <Input
                value={block.metadata?.caption || ''}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="Image caption (optional)..."
                className="text-sm"
              />
            </>
          )}
          
          {readonly && block.metadata?.caption && (
            <p className="text-sm text-gray-600 text-center italic">
              {block.metadata.caption}
            </p>
          )}
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
          onClick={!readonly ? handleImageSelect : undefined}
        >
          <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Click to select an image</p>
        </div>
      )}
    </div>
  )
}

interface QuoteBlockProps extends BlockComponentProps {
  block: BlockComponentProps['block'] & {
    type: 'quote'
    content: { text: string; author?: string }
  }
}

export function QuoteBlock({ 
  block, 
  isSelected, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  readonly = false 
}: QuoteBlockProps) {
  const handleTextChange = (text: string) => {
    onUpdate({ ...block.content, text })
  }

  const handleAuthorChange = (author: string) => {
    onUpdate({ ...block.content, author })
  }

  return (
    <div className={`relative group border rounded-lg p-4 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {!readonly && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="border-l-4 border-gray-300 pl-4 space-y-3">
        <Textarea
          value={block.content.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter your quote..."
          className="border-none p-0 italic text-lg resize-none focus:ring-0 focus:outline-none"
          rows={Math.max(2, Math.ceil(block.content.text.length / 60))}
          readOnly={readonly}
        />
        
        <Input
          value={block.content.author || ''}
          onChange={(e) => handleAuthorChange(e.target.value)}
          placeholder="Quote author (optional)..."
          className="border-none p-0 text-sm focus:ring-0 focus:outline-none"
          readOnly={readonly}
        />
      </div>
    </div>
  )
}

interface DividerBlockProps extends BlockComponentProps {
  block: BlockComponentProps['block'] & {
    type: 'divider'
  }
}

export function DividerBlock({ 
  isSelected, 
  onDelete, 
  onDuplicate,
  readonly = false 
}: DividerBlockProps) {
  return (
    <div className={`relative group border rounded-lg p-4 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {!readonly && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
      
      <hr className="border-gray-300" />
    </div>
  )
}
