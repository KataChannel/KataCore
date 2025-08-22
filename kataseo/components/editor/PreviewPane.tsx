"use client"

import React from 'react'
import { Block } from '@/types/editor'
import { DraggableBlock } from './DraggableBlock'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, Code, Smartphone, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PreviewPaneProps {
  blocks: Block[]
  isVisible: boolean
  onToggle: () => void
  className?: string
}

export function PreviewPane({ blocks, isVisible, onToggle, className }: PreviewPaneProps) {
  const [viewMode, setViewMode] = React.useState<'preview' | 'code'>('preview')
  const [deviceMode, setDeviceMode] = React.useState<'desktop' | 'mobile'>('desktop')

  const generateHTML = (blocks: Block[]) => {
    return blocks.map(block => {
      switch (block.type) {
        case 'text':
          return block.html || `<p>${block.content || ''}</p>`
        
        case 'heading':
          const level = block.level || 2
          return `<h${level}>${block.content || `Heading ${level}`}</h${level}>`
        
        case 'image':
          if (!block.url) return ''
          return `<img src="${block.url}" alt="${block.altText || ''}" style="max-width: 100%; height: auto;" />`
        
        case 'embed':
          if (!block.embedUrl) return ''
          return `<iframe src="${block.embedUrl}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`
        
        case 'code':
          const language = block.language || 'javascript'
          return `<pre><code class="language-${language}">${block.content || ''}</code></pre>`
        
        default:
          return ''
      }
    }).join('\n')
  }

  const htmlContent = generateHTML(blocks)

  if (!isVisible) {
    return (
      <div className={cn("fixed top-4 right-4 z-50", className)}>
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="gap-2 bg-white shadow-lg"
        >
          <Eye className="h-4 w-4" />
          Show Preview
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full w-1/2 bg-white border-l border-gray-200 z-40 flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">Live Preview</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-md border border-gray-300 p-1">
            <Button
              variant={viewMode === 'preview' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="px-3 py-1 h-auto"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant={viewMode === 'code' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('code')}
              className="px-3 py-1 h-auto"
            >
              <Code className="h-4 w-4 mr-1" />
              HTML
            </Button>
          </div>

          {/* Device mode toggle (only for preview) */}
          {viewMode === 'preview' && (
            <div className="flex rounded-md border border-gray-300 p-1">
              <Button
                variant={deviceMode === 'desktop' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode('desktop')}
                className="px-3 py-1 h-auto"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceMode === 'mobile' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDeviceMode('mobile')}
                className="px-3 py-1 h-auto"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Close button */}
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'preview' ? (
          <div className={cn(
            "p-4 transition-all duration-300",
            deviceMode === 'mobile' && "max-w-sm mx-auto"
          )}>
            {blocks.length > 0 ? (
              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <DraggableBlock
                    key={block.id}
                    block={block}
                    index={index}
                    readOnly={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No content to preview</p>
                <p className="text-sm">Add some blocks to see the preview</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{htmlContent || '<!-- No content -->'}</code>
            </pre>
            
            {/* Copy HTML button */}
            <div className="mt-4">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(htmlContent)
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Code className="h-4 w-4" />
                Copy HTML
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div className="text-xs text-gray-600 flex items-center justify-between">
          <span>
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </span>
          <span>
            {htmlContent.length} characters
          </span>
        </div>
      </div>
    </div>
  )
}

// Floating preview toggle for mobile
export function FloatingPreviewToggle({ 
  isVisible, 
  onToggle 
}: { 
  isVisible: boolean
  onToggle: () => void 
}) {
  return (
    <Button
      onClick={onToggle}
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg",
        "lg:hidden" // Only show on mobile
      )}
    >
      {isVisible ? (
        <EyeOff className="h-6 w-6" />
      ) : (
        <Eye className="h-6 w-6" />
      )}
    </Button>
  )
}
