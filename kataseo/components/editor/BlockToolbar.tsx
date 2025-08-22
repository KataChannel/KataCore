"use client"

import React from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/DropdownMenu'
import { 
  Plus, 
  Type, 
  Heading1, 
  Heading2, 
  Image, 
  PlayCircle, 
  Code,
  ChevronDown
} from 'lucide-react'
import { Block, BLOCK_TYPES } from '@/types/editor'
import { useEditor } from './EditorContext'
import { cn } from '@/lib/utils/cn'

interface BlockToolbarProps {
  className?: string
  onAddBlock?: (type: Block['type']) => void
}

export function BlockToolbar({ className, onAddBlock }: BlockToolbarProps) {
  const { addBlock } = useEditor()

  const handleAddBlock = (type: Block['type']) => {
    if (onAddBlock) {
      onAddBlock(type)
    } else {
      addBlock(type)
    }
  }

  const getIcon = (iconName: string) => {
    const iconMap = {
      Type: Type,
      Heading1: Heading1,
      Image: Image,
      PlayCircle: PlayCircle,
      Code: Code
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Type
    return IconComponent
  }

  return (
    <div className={cn("flex items-center justify-center py-4", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Block
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <DropdownMenuLabel>Add Content Block</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(BLOCK_TYPES).map(([type, config]) => {
            const IconComponent = getIcon(config.icon)
            return (
              <DropdownMenuItem
                key={type}
                onClick={() => handleAddBlock(type as Block['type'])}
                className="flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-blue-50"
              >
                <IconComponent className="h-4 w-4 text-gray-600" />
                <div className="flex flex-col items-start">
                  <span className="font-medium text-gray-900">{config.label}</span>
                  <span className="text-xs text-gray-500">{config.description}</span>
                </div>
              </DropdownMenuItem>
            )
          })}
          
          <DropdownMenuSeparator />
          
          {/* Heading submenu */}
          <DropdownMenuItem
            onClick={() => handleAddBlock('heading')}
            className="flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-blue-50"
          >
            <Heading2 className="h-4 w-4 text-gray-600" />
            <div className="flex flex-col items-start">
              <span className="font-medium text-gray-900">Heading</span>
              <span className="text-xs text-gray-500">H1, H2, H3, H4, H5, H6</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Alternative inline toolbar for quick access
export function InlineBlockToolbar({ 
  onAddBlock, 
  className 
}: { 
  onAddBlock: (type: Block['type']) => void
  className?: string 
}) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-white border rounded-lg shadow-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddBlock('text')}
        className="p-2"
        title="Text"
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddBlock('heading')}
        className="p-2"
        title="Heading"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddBlock('image')}
        className="p-2"
        title="Image"
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddBlock('embed')}
        className="p-2"
        title="Embed"
      >
        <PlayCircle className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddBlock('code')}
        className="p-2"
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  )
}
