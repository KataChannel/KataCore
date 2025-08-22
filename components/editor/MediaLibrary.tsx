'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MediaFile } from '@/types/editor'
import { Search, Upload, X, Grid, List, Filter, Image, FileText, Video } from 'lucide-react'

interface MediaLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaFile | MediaFile[]) => void
  multiple?: boolean
  accept?: string[]
  selectedFiles?: MediaFile[]
}

export function MediaLibrary({ 
  isOpen, 
  onClose, 
  onSelect, 
  multiple = false,
  accept = [],
  selectedFiles = []
}: MediaLibraryProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'images' | 'documents' | 'videos'>('all')
  const [selected, setSelected] = useState<MediaFile[]>(selectedFiles)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch media files
  useEffect(() => {
    if (isOpen) {
      fetchMediaFiles()
    }
  }, [isOpen, searchQuery, filter, page])

  const fetchMediaFiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        type: filter === 'all' ? '' : filter,
        page: page.toString(),
        limit: '20'
      })
      
      const response = await fetch(`/api/cms/media?${params}`)
      const data = await response.json()
      
      if (data.success) {
        if (page === 1) {
          setMediaFiles(data.data.media)
        } else {
          setMediaFiles(prev => [...prev, ...data.data.media])
        }
        setHasMore(data.data.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/cms/media/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setMediaFiles(prev => [...data.data, ...prev])
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (media: MediaFile) => {
    if (multiple) {
      const isSelected = selected.some(s => s.id === media.id)
      if (isSelected) {
        setSelected(prev => prev.filter(s => s.id !== media.id))
      } else {
        setSelected(prev => [...prev, media])
      }
    } else {
      onSelect(media)
      onClose()
    }
  }

  const handleConfirmSelection = () => {
    if (multiple && selected.length > 0) {
      onSelect(selected)
      onClose()
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = mediaFiles.filter(file => {
    if (accept.length > 0 && !accept.includes(file.mimeType)) return false
    if (filter === 'images' && !file.mimeType.startsWith('image/')) return false
    if (filter === 'videos' && !file.mimeType.startsWith('video/')) return false
    if (filter === 'documents' && file.mimeType.startsWith('image/')) return false
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Media Library</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search media files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="documents">Documents</option>
            </select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </Button>
            
            {multiple && selected.length > 0 && (
              <Button onClick={handleConfirmSelection}>
                Select {selected.length} file{selected.length > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading media files...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No media files found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selected.some(s => s.id === file.id)
                return (
                  <div
                    key={file.id}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                      isSelected ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelect(file)}
                  >
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.altText || file.originalName}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                    
                    <div className="p-2">
                      <p className="text-xs font-medium truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const isSelected = selected.some(s => s.id === file.id)
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleSelect(file)}
                  >
                    <div className="w-12 h-12 flex-shrink-0">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.altText || file.originalName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                      {file.altText && (
                        <p className="text-xs text-gray-400 truncate">{file.altText}</p>
                      )}
                    </div>
                    
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files)
            }
          }}
        />
      </div>
    </div>
  )
}
