"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { ChevronDown, Heading1, Heading2, Heading3 } from 'lucide-react'
import { Block } from '@/types/editor'
import { cn } from '@/lib/utils/cn'

interface HeadingBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  isSelected: boolean
  readOnly?: boolean
}

export function HeadingBlock({ block, onUpdate, isSelected, readOnly = false }: HeadingBlockProps) {
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const level = block.level || 2

  const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    const content = e.currentTarget.innerText
    onUpdate({ content })
  }

  const handleLevelChange = (newLevel: 1 | 2 | 3 | 4 | 5 | 6) => {
    onUpdate({ level: newLevel })
    setShowLevelSelector(false)
  }

  const getHeadingClass = (level: number) => {
    const baseClasses = "font-bold outline-none"
    const levelClasses = {
      1: "text-4xl",
      2: "text-3xl", 
      3: "text-2xl",
      4: "text-xl",
      5: "text-lg",
      6: "text-base"
    }
    return cn(baseClasses, levelClasses[level as keyof typeof levelClasses])
  }

  const getHeadingIcon = (level: number) => {
    if (level <= 1) return Heading1
    if (level <= 2) return Heading2
    return Heading3
  }

  const renderHeading = () => {
    const className = cn(
      getHeadingClass(level),
      "w-full p-3 rounded-md border-2 border-transparent transition-colors",
      !readOnly && "focus:border-blue-300 focus:bg-blue-50/20",
      isSelected && !readOnly && "border-blue-300 bg-blue-50/20"
    )

    const content = block.content || `Heading ${level}`
    
    const props = {
      contentEditable: !readOnly,
      suppressContentEditableWarning: true,
      className,
      onInput: handleInput,
      children: content
    }

    switch (level) {
      case 1: return <h1 {...props} />
      case 2: return <h2 {...props} />
      case 3: return <h3 {...props} />
      case 4: return <h4 {...props} />
      case 5: return <h5 {...props} />
      case 6: return <h6 {...props} />
      default: return <h2 {...props} />
    }
  }

  if (readOnly) {
    return renderHeading()
  }

  return (
    <div className="relative group">
      {/* Level Selector */}
      {(isSelected || showLevelSelector) && (
        <div className="absolute -top-12 left-0 z-10">
          <DropdownMenu open={showLevelSelector} onOpenChange={setShowLevelSelector}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
              >
                H{level}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[1, 2, 3, 4, 5, 6].map((headingLevel) => {
                const IconComponent = getHeadingIcon(headingLevel)
                return (
                  <DropdownMenuItem
                    key={headingLevel}
                    onClick={() => handleLevelChange(headingLevel as 1 | 2 | 3 | 4 | 5 | 6)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className={getHeadingClass(headingLevel)}>
                      Heading {headingLevel}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Heading Content */}
      {renderHeading()}
    </div>
  )
}
