"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MediaPicker } from '../MediaPicker'
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  ExternalLink,
  Edit3,
  Check,
  AlertCircle,
  Library,
  Loader2
} from 'lucide-react'
import { Block } from '@/types/editor'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  altText?: string
  mimeType: string
  size: number
  uploadedAt: string
}

interface ImageBlockProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  isSelected: boolean
  readOnly?: boolean
}

export function ImageBlock({ block, onUpdate, isSelected, readOnly = false }: ImageBlockProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [showAltInput, setShowAltInput] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [urlInput, setUrlInput] = useState(block.url || '')
  const [altInput, setAltInput] = useState(block.altText || '')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be less than 10MB')
      }

      // Upload to media API
      const formData = new FormData()
      formData.append('files', file)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const uploadedFiles = await response.json()
      const uploadedFile = uploadedFiles[0]

      if (uploadedFile) {
        onUpdate({ 
          url: uploadedFile.url,
          altText: uploadedFile.altText || file.name.replace(/\.[^/.]+$/, ""),
          mediaId: uploadedFile.id,
          width: 800,
          height: 600
        })
      }

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleMediaSelect = (media: MediaFile) => {
    onUpdate({ 
      url: media.url,
      altText: media.altText || media.originalName,
      mediaId: media.id,
      width: 800,
      height: 600
    })
    setShowMediaPicker(false)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpdate({ url: urlInput.trim() })
      setShowUrlInput(false)
    }
  }

  const handleAltSubmit = () => {
    onUpdate({ altText: altInput })
    setShowAltInput(false)
  }

  const removeImage = () => {
    onUpdate({ url: undefined, altText: undefined, mediaId: undefined })
  }

  if (readOnly) {
    return block.url ? (
      <div className="w-full">
        <Image
          src={block.url}
          alt={block.altText || ''}
          width={block.width || 800}
          height={block.height || 600}
          className="max-w-full h-auto rounded-lg"
          loading="lazy"
        />
        {block.altText && (
          <p className="text-sm text-gray-600 mt-2 text-center italic">
            {block.altText}
          </p>
        )}
      </div>
    ) : null
  }

  // Show image if uploaded
  if (block.url) {
    return (
      <div className={cn(
        "relative group rounded-lg overflow-hidden",
        isSelected && "ring-2 ring-blue-500"
      )}>
        <Image
          src={block.url}
          alt={block.altText || ''}
          width={block.width || 800}
          height={block.height || 600}
          className="w-full h-auto max-h-96 object-cover"
        />
        
        {/* Overlay controls */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAltInput(true)}
              className="bg-white"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Alt Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(true)}
              className="bg-white"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Change URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMediaPicker(true)}
              className="bg-white"
            >
              <Library className="h-4 w-4 mr-1" />
              Media Library
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white"
            >
              <Upload className="h-4 w-4 mr-1" />
              Replace
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeImage}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Alt text input overlay */}
        {showAltInput && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-95">
            <div className="flex gap-2">
              <Input
                value={altInput}
                onChange={(e) => setAltInput(e.target.value)}
                placeholder="Describe this image..."
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleAltSubmit}>
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowAltInput(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* URL input overlay */}
        {showUrlInput && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-95">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleUrlSubmit}>
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowUrlInput(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    )
  }

  // Show upload interface
  return (
    <div className={cn(
      "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors",
      isSelected && "border-blue-400 bg-blue-50/20",
      "hover:border-gray-400 hover:bg-gray-50"
    )}>
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Uploading image...</p>
        </div>
      ) : (
        <>
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add an image</h3>
          <p className="text-gray-600 mb-4">Upload an image or paste a URL</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Image
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMediaPicker(true)}
              className="gap-2"
            >
              <Library className="h-4 w-4" />
              Media Library
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUrlInput(true)}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Add URL
            </Button>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{uploadError}</span>
            </div>
          )}

          {/* URL Input */}
          {showUrlInput && (
            <div className="mt-4 flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleUrlSubmit}>
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowUrlInput(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image/*']}
        multiple={false}
      />
    </div>
  )
}
