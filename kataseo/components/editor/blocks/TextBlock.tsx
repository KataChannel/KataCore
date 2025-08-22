"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Code
} from 'lucide-react'
import { Block } from '@/types/editor'
import { cn } from '@/lib/utils/cn'

interface TextBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  isSelected: boolean
  readOnly?: boolean
}

export function TextBlock({ block, onUpdate, isSelected, readOnly = false }: TextBlockProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSelected && !readOnly) {
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }, [isSelected, readOnly])

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerText
      const html = editorRef.current.innerHTML
      onUpdate({ content, html })
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          formatText('bold')
          break
        case 'i':
          e.preventDefault()
          formatText('italic')
          break
        case 'u':
          e.preventDefault()
          formatText('underline')
          break
      }
    }
  }

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    handleInput()
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      formatText('createLink', url)
    }
  }

  if (readOnly) {
    return (
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: block.html || block.content || '' }}
      />
    )
  }

  return (
    <div className="relative">
      {/* Rich Text Toolbar */}
      {showToolbar && (
        <div 
          ref={toolbarRef}
          className="absolute -top-12 left-0 z-10 flex items-center gap-1 p-2 bg-white border rounded-lg shadow-lg"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="p-1.5"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className="p-1.5"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            className="p-1.5"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            className="p-1.5"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('insertUnorderedList')}
            className="p-1.5"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('insertOrderedList')}
            className="p-1.5"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('formatBlock', 'blockquote')}
            className="p-1.5"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('formatBlock', 'pre')}
            className="p-1.5"
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editable Content */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          "outline-none min-h-[2rem] p-3 rounded-md border-2 border-transparent",
          "focus:border-blue-300 focus:bg-blue-50/20 transition-colors",
          "prose prose-sm max-w-none",
          isSelected && "border-blue-300 bg-blue-50/20"
        )}
        dangerouslySetInnerHTML={{ 
          __html: block.html || `<p>${block.content || 'Type something...'}</p>` 
        }}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowToolbar(true)}
        onBlur={(e) => {
          // Only hide toolbar if not clicking on toolbar
          if (!toolbarRef.current?.contains(e.relatedTarget as Node)) {
            setShowToolbar(false)
          }
        }}
      />
    </div>
  )
}
