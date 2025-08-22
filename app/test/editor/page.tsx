'use client'

import React, { useState } from 'react'
import { EditorProvider } from '@/components/editor/EditorContext'
import { BlockEditor } from '@/components/editor/BlockEditor'
import { Block } from '@/types/editor'

// Sample initial content
const initialBlocks: Block[] = [
  {
    id: '1',
    type: 'heading',
    content: 'Welcome to Rich Text Editor',
    metadata: { level: 1 }
  },
  {
    id: '2',
    type: 'paragraph',
    content: 'This is a powerful block-based editor that allows you to create rich content with various block types.',
    metadata: {}
  },
  {
    id: '3',
    type: 'quote',
    content: 'The future belongs to those who believe in the beauty of their dreams.',
    metadata: {}
  }
]

export default function EditorTestPage() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const [savedContent, setSavedContent] = useState<string>('')

  const handleSave = (blocks: Block[]) => {
    setSavedContent(JSON.stringify(blocks, null, 2))
    console.log('Saved blocks:', blocks)
  }

  const handleChange = (blocks: Block[]) => {
    setBlocks(blocks)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rich Text Editor Demo
            </h1>
            <p className="text-gray-600">
              Test the block-based content editor with drag-drop functionality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Content Editor</h2>
                </div>
                <div className="p-4">
                  <EditorProvider
                    initialBlocks={blocks}
                    config={{
                      maxBlocks: 50,
                      allowedBlocks: ['paragraph', 'heading', 'image', 'quote', 'divider'],
                      enableDragDrop: true,
                      enableKeyboardShortcuts: true
                    }}
                  >
                    <BlockEditor
                      onChange={handleChange}
                      onSave={handleSave}
                      className="min-h-[500px]"
                    />
                  </EditorProvider>
                </div>
              </div>
            </div>

            {/* Preview/Output */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Block Stats */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-3">Editor Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Blocks:</span>
                      <span className="font-medium">{blocks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paragraphs:</span>
                      <span className="font-medium">
                        {blocks.filter(b => b.type === 'paragraph').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Headings:</span>
                      <span className="font-medium">
                        {blocks.filter(b => b.type === 'heading').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span className="font-medium">
                        {blocks.filter(b => b.type === 'image').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quotes:</span>
                      <span className="font-medium">
                        {blocks.filter(b => b.type === 'quote').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* JSON Output */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-3">Live JSON Output</h3>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(blocks, null, 2)}
                  </pre>
                </div>

                {/* Saved Content */}
                {savedContent && (
                  <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold mb-3">Last Saved Content</h3>
                    <pre className="text-xs bg-green-50 p-3 rounded overflow-auto max-h-48">
                      {savedContent}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Readonly Preview */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Readonly Preview</h2>
                <p className="text-sm text-gray-600">
                  How the content will appear to end users
                </p>
              </div>
              <div className="p-4">
                <EditorProvider
                  initialBlocks={blocks}
                  config={{
                    maxBlocks: 50,
                    allowedBlocks: ['paragraph', 'heading', 'image', 'quote', 'divider'],
                    enableDragDrop: false,
                    enableKeyboardShortcuts: false
                  }}
                >
                  <BlockEditor readonly={true} />
                </EditorProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
