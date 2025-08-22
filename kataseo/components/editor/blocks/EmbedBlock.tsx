"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  PlayCircle, 
  ExternalLink, 
  Check, 
  X,
  AlertCircle,
  Globe
} from 'lucide-react'
import { Block } from '@/types/editor'
import { cn } from '@/lib/utils/cn'

interface EmbedBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  isSelected: boolean
  readOnly?: boolean
}

export function EmbedBlock({ block, onUpdate, isSelected, readOnly = false }: EmbedBlockProps) {
  const [showUrlInput, setShowUrlInput] = useState(!block.embedUrl)
  const [urlInput, setUrlInput] = useState(block.embedUrl || '')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const parseEmbedUrl = (url: string) => {
    setError(null)
    
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    
    if (youtubeMatch) {
      return {
        type: 'youtube' as const,
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      }
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    
    if (vimeoMatch) {
      return {
        type: 'vimeo' as const,
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
    }

    // Generic iframe (for other embeds)
    if (url.startsWith('http')) {
      return {
        type: 'iframe' as const,
        id: url,
        embedUrl: url
      }
    }

    return null
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    const parsed = parseEmbedUrl(urlInput.trim())
    
    if (parsed) {
      onUpdate({
        embedUrl: parsed.embedUrl,
        embedType: parsed.type,
        content: urlInput.trim()
      })
      setShowUrlInput(false)
      setError(null)
    } else {
      setError('Unsupported URL. Please use YouTube, Vimeo, or a valid iframe URL.')
    }
    
    setIsLoading(false)
  }

  const handleEdit = () => {
    setUrlInput(block.content || block.embedUrl || '')
    setShowUrlInput(true)
  }

  const handleRemove = () => {
    onUpdate({
      embedUrl: undefined,
      embedType: undefined,
      content: undefined
    })
    setShowUrlInput(true)
  }

  const renderEmbed = () => {
    if (!block.embedUrl) return null

    const aspectRatio = "aspect-video" // 16:9 aspect ratio
    
    return (
      <div className={cn(
        "relative group rounded-lg overflow-hidden bg-gray-100",
        aspectRatio,
        isSelected && "ring-2 ring-blue-500"
      )}>
        <iframe
          src={block.embedUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded content"
        />
        
        {!readOnly && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="bg-white"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Edit URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (readOnly) {
    return block.embedUrl ? renderEmbed() : null
  }

  if (block.embedUrl && !showUrlInput) {
    return renderEmbed()
  }

  // Show input interface
  return (
    <div className={cn(
      "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors",
      isSelected && "border-blue-400 bg-blue-50/20",
      "hover:border-gray-400 hover:bg-gray-50"
    )}>
      <PlayCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Embed media</h3>
      <p className="text-gray-600 mb-4">
        Paste a YouTube, Vimeo URL, or any iframe source
      </p>
      
      <div className="max-w-md mx-auto">
        <div className="flex gap-2 mb-3">
          <Input
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value)
              setError(null)
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit()
              }
            }}
          />
          <Button 
            onClick={handleUrlSubmit}
            disabled={isLoading || !urlInput.trim()}
            size="sm"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          {block.embedUrl && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-3">
          <p className="flex items-center justify-center gap-1 mb-1">
            <PlayCircle className="h-3 w-3" />
            YouTube, Vimeo supported
          </p>
          <p className="flex items-center justify-center gap-1">
            <Globe className="h-3 w-3" />
            Or any embeddable iframe URL
          </p>
        </div>
      </div>
    </div>
  )
}
