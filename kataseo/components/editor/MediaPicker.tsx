"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { 
  Search, 
  Upload, 
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  File,
  Plus,
  Check,
  X,
  Loader2
} from 'lucide-react'
import useSWR from 'swr'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

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

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaFile) => void
  allowedTypes?: string[]
  multiple?: boolean
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.startsWith('video/')) return Video
  return File
}

export function MediaPicker({ 
  isOpen, 
  onClose, 
  onSelect, 
  allowedTypes = ['image/*'], 
  multiple = false 
}: MediaPickerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch media files
  const { data: mediaFiles = [], error, mutate } = useSWR<MediaFile[]>(
    isOpen ? `/api/media?search=${searchQuery}&type=${selectedType}` : null,
    fetcher
  )

  // Filter files based on allowed types
  const filteredFiles = mediaFiles.filter(file => {
    if (allowedTypes.includes('*/*')) return true
    return allowedTypes.some(type => {
      if (type === 'image/*') return file.mimeType.startsWith('image/')
      if (type === 'video/*') return file.mimeType.startsWith('video/')
      if (type === 'audio/*') return file.mimeType.startsWith('audio/')
      return file.mimeType === type
    })
  })

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const uploadedFiles = await response.json()
      
      // Refresh the media list
      mutate()
      
      // Auto-select the first uploaded file if single selection
      if (!multiple && uploadedFiles.length > 0) {
        onSelect(uploadedFiles[0])
        onClose()
      }
      
      setShowUpload(false)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelect = (file: MediaFile) => {
    if (multiple) {
      if (selectedFiles.includes(file.id)) {
        setSelectedFiles(prev => prev.filter(id => id !== file.id))
      } else {
        setSelectedFiles(prev => [...prev, file.id])
      }
    } else {
      onSelect(file)
      onClose()
    }
  }

  const handleConfirmSelection = () => {
    if (multiple && selectedFiles.length > 0) {
      const selected = filteredFiles.filter(file => selectedFiles.includes(file.id))
      selected.forEach(file => onSelect(file))
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Media Library</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
        </div>

        {/* Upload Zone */}
        {showUpload && (
          <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
              <input
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="media-upload"
                disabled={isUploading}
              />
              <label htmlFor="media-upload">
                <Button variant="primary" disabled={isUploading} className="gap-2">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Choose Files
                    </>
                  )}
                </Button>
              </label>
            </div>
          </div>
        )}

        {/* Media Grid/List */}
        <div className="max-h-96 overflow-y-auto">
          {error && (
            <div className="text-center py-8 text-red-600">
              Error loading media files
            </div>
          )}

          {filteredFiles.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              No files found
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.mimeType)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <div
                    key={file.id}
                    className={cn(
                      "relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 hover:border-blue-300 transition-colors",
                      isSelected && "border-blue-500 bg-blue-50"
                    )}
                    onClick={() => handleSelect(file)}
                  >
                    {file.mimeType.startsWith('image/') ? (
                      <Image
                        src={file.url}
                        alt={file.altText || file.originalName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    {(multiple && isSelected) && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1">
                      <p className="text-xs truncate">{file.originalName}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.mimeType)
                const isSelected = selectedFiles.includes(file.id)
                
                return (
                  <div
                    key={file.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50",
                      isSelected && "bg-blue-50 border-blue-300"
                    )}
                    onClick={() => handleSelect(file)}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {file.mimeType.startsWith('image/') ? (
                        <Image
                          src={file.url}
                          alt={file.altText || file.originalName}
                          width={40}
                          height={40}
                          className="object-cover rounded"
                        />
                      ) : (
                        <FileIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {(multiple && isSelected) && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {multiple && selectedFiles.length > 0 && (
          <Button variant="primary" onClick={handleConfirmSelection}>
            Select {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  )
}
