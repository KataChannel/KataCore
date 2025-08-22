"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Textarea } from '@/components/ui/Textarea'
import { 
  Code, 
  Copy, 
  Check,
  ChevronDown 
} from 'lucide-react'
import { Block } from '@/types/editor'
import { cn } from '@/lib/utils/cn'

interface CodeBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  isSelected: boolean
  readOnly?: boolean
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
]

export function CodeBlock({ block, onUpdate, isSelected, readOnly = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = block.language || 'javascript'
  const content = block.content || ''

  const handleContentChange = (newContent: string) => {
    onUpdate({ content: newContent })
  }

  const handleLanguageChange = (newLanguage: string) => {
    onUpdate({ language: newLanguage })
  }

  const copyToClipboard = async () => {
    if (!content) return
    
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const getLanguageLabel = (lang: string) => {
    return LANGUAGES.find(l => l.value === lang)?.label || lang
  }

  if (readOnly) {
    return (
      <div className="relative group">
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-sm text-gray-300 font-medium">
              {getLanguageLabel(language)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-gray-300 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Code Content */}
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-gray-100 whitespace-pre">
              {content || '// Your code here...'}
            </code>
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative group rounded-lg overflow-hidden border-2",
      isSelected ? "border-blue-500" : "border-gray-200",
      "hover:border-gray-300 transition-colors"
    )}>
      <div className="bg-gray-900">
        {/* Header with controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-gray-400" />
            
            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-700 text-sm gap-1"
                >
                  {getLanguageLabel(language)}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.value}
                    onClick={() => handleLanguageChange(lang.value)}
                    className={cn(
                      "cursor-pointer",
                      language === lang.value && "bg-blue-50 text-blue-700"
                    )}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Copy button */}
          {content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Code input area */}
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`// Write your ${getLanguageLabel(language).toLowerCase()} code here...`}
            className={cn(
              "min-h-[150px] p-4 bg-gray-900 text-gray-100 border-none resize-none",
              "font-mono text-sm leading-relaxed",
              "focus:ring-0 focus:outline-none",
              "placeholder:text-gray-500"
            )}
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
            }}
          />
          
          {/* Line numbers overlay (optional) */}
          {content && (
            <div className="absolute left-0 top-0 p-4 pointer-events-none select-none">
              <div className="font-mono text-sm text-gray-600 leading-relaxed">
                {content.split('\n').map((_, index) => (
                  <div key={index} className="h-[1.5rem]">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {content.split('\n').length} lines • {content.length} characters
            </span>
            <span>
              Press Tab for indentation
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
