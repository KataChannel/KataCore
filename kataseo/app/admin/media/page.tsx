"use client"
import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table } from '@/components/ui/Table'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { 
  Upload, 
  Search, 
  Trash2, 
  Eye, 
  Download,
  Plus,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  File,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
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
  uploadedBy: {
    id: string
    email: string
  }
}

interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)

  // Fetch media files
  const { data: mediaFiles = [], error, mutate } = useSWR<MediaFile[]>(
    `/api/media?search=${searchQuery}&type=${selectedType}`,
    fetcher
  )

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const uploadProgress: UploadProgress = {
        filename: file.name,
        progress: 0,
        status: 'uploading'
      }

      setUploadQueue(prev => [...prev, uploadProgress])

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate upload progress
        const xhr = new XMLHttpRequest()
        
        return new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100)
              setUploadQueue(prev => 
                prev.map(item => 
                  item.filename === file.name 
                    ? { ...item, progress }
                    : item
                )
              )
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              setUploadQueue(prev => 
                prev.map(item => 
                  item.filename === file.name 
                    ? { ...item, status: 'success', progress: 100 }
                    : item
                )
              )
              resolve()
            } else {
              throw new Error('Upload failed')
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'))
          })

          xhr.open('POST', '/api/media')
          xhr.send(formData)
        })
      } catch (error) {
        setUploadQueue(prev => 
          prev.map(item => 
            item.filename === file.name 
              ? { 
                  ...item, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : item
          )
        )
      }
    })

    await Promise.all(uploadPromises)
    
    // Refresh media list
    mutate()
    
    // Clear upload queue after 3 seconds
    setTimeout(() => {
      setUploadQueue([])
    }, 3000)
  }

  const handleDelete = async (fileIds: string[]) => {
    try {
      await Promise.all(fileIds.map(id => 
        fetch(`/api/media/${id}`, { method: 'DELETE' })
      ))
      mutate()
      setSelectedFiles([])
    } catch (error) {
      console.error('Failed to delete files:', error)
    }
  }

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === mediaFiles.length 
        ? [] 
        : mediaFiles.map(file => file.id)
    )
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.startsWith('video/')) return Video
    return File
  }

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'image' && file.mimeType.startsWith('image/')) ||
                       (selectedType === 'video' && file.mimeType.startsWith('video/')) ||
                       (selectedType === 'document' && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'))
    
    return matchesSearch && matchesType
  })

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error loading media</h1>
          <p className="text-gray-600">Failed to load media files.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
              {selectedFiles.length > 0 && ` • ${selectedFiles.length} selected`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedFiles.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(selectedFiles)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedFiles.length})
              </Button>
            )}
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-10 w-64"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'image' | 'video' | 'document')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadQueue.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">Uploading Files</h3>
          <div className="space-y-2">
            {uploadQueue.map((upload, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-900">{upload.filename}</span>
                    <span className="text-blue-700">
                      {upload.status === 'uploading' && `${upload.progress}%`}
                      {upload.status === 'success' && <CheckCircle className="h-4 w-4" />}
                      {upload.status === 'error' && <AlertCircle className="h-4 w-4" />}
                    </span>
                  </div>
                  {upload.status === 'uploading' && (
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.error && (
                    <p className="text-red-600 text-xs mt-1">{upload.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.mimeType)
              const isSelected = selectedFiles.includes(file.id)
              
              return (
                <div
                  key={file.id}
                  className={cn(
                    "relative group bg-white rounded-lg border-2 border-gray-200 p-3 cursor-pointer transition-all hover:border-blue-300",
                    isSelected && "border-blue-500 bg-blue-50"
                  )}
                  onClick={() => handleSelectFile(file.id)}
                >
                  <div className="aspect-square flex items-center justify-center mb-2">
                    {file.mimeType.startsWith('image/') ? (
                      <Image
                        src={file.url}
                        alt={file.altText || file.originalName}
                        width={120}
                        height={120}
                        className="object-cover rounded"
                      />
                    ) : (
                      <FileIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewFile(file)
                        }}
                        className="bg-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(file.url, '_blank')
                        }}
                        className="bg-white"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  Select All ({filteredFiles.length})
                </span>
              </label>
            </div>
            
            <Table
              columns={[
                {
                  key: 'select',
                  title: '',
                  render: (value: unknown, record: MediaFile) => (
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(record.id)}
                      onChange={() => handleSelectFile(record.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )
                },
                {
                  key: 'thumbnail',
                  title: 'Preview',
                  render: (value: unknown, record: MediaFile) => {
                    const FileIcon = getFileIcon(record.mimeType)
                    return (
                      <div className="w-12 h-12 flex items-center justify-center">
                        {record.mimeType.startsWith('image/') ? (
                          <Image
                            src={record.url}
                            alt={record.altText || record.originalName}
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        ) : (
                          <FileIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    )
                  }
                },
                {
                  key: 'name',
                  title: 'Name',
                  render: (value: unknown, record: MediaFile) => (
                    <div>
                      <p className="font-medium text-gray-900">{record.originalName}</p>
                      <p className="text-sm text-gray-500">{record.filename}</p>
                    </div>
                  )
                },
                {
                  key: 'type',
                  title: 'Type',
                  render: (value: unknown, record: MediaFile) => (
                    <span className="text-sm text-gray-600">{record.mimeType}</span>
                  )
                },
                {
                  key: 'size',
                  title: 'Size',
                  render: (value: unknown, record: MediaFile) => (
                    <span className="text-sm text-gray-600">{formatFileSize(record.size)}</span>
                  )
                },
                {
                  key: 'uploadedAt',
                  title: 'Uploaded',
                  render: (value: unknown, record: MediaFile) => (
                    <span className="text-sm text-gray-600">
                      {new Date(record.uploadedAt).toLocaleDateString()}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  render: (value: unknown, record: MediaFile) => (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewFile(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(record.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete([record.id])}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }
              ]}
              data={filteredFiles}
            />
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload some files to get started'
              }
            </p>
            <Button
              variant="primary"
              onClick={() => setShowUploadModal(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader>
          <h2 className="text-lg font-semibold">Upload Files</h2>
        </ModalHeader>
        <ModalBody>
          <FileUploadZone onFilesSelected={handleFileUpload} />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowUploadModal(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Preview Modal */}
      {previewFile && (
        <MediaPreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDelete={() => {
            handleDelete([previewFile.id])
            setPreviewFile(null)
          }}
        />
      )}
    </div>
  )
}

// File Upload Zone Component
function FileUploadZone({ onFilesSelected }: { onFilesSelected: (files: FileList) => void }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors",
        isDragOver && "border-blue-400 bg-blue-50"
      )}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Drop files here or click to upload
      </h3>
      <p className="text-gray-600 mb-4">
        Support for images, videos, and documents up to 10MB
      </p>
      
      <input
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Button variant="primary" className="gap-2">
          <Plus className="h-4 w-4" />
          Choose Files
        </Button>
      </label>
    </div>
  )
}

// Media Preview Modal Component
function MediaPreviewModal({ 
  file, 
  onClose, 
  onDelete 
}: { 
  file: MediaFile
  onClose: () => void
  onDelete: () => void 
}) {
  const [altText, setAltText] = useState(file.altText || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveAltText = async () => {
    setIsSaving(true)
    try {
      await fetch(`/api/media/${file.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText })
      })
      // Update would be handled by parent component
    } catch (error) {
      console.error('Failed to update alt text:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{file.originalName}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            {file.mimeType.startsWith('image/') ? (
              <Image
                src={file.url}
                alt={file.altText || file.originalName}
                width={400}
                height={400}
                className="object-contain rounded-lg max-w-full max-h-full"
              />
            ) : file.mimeType.startsWith('video/') ? (
              <video
                src={file.url}
                controls
                className="max-w-full max-h-full rounded-lg"
              />
            ) : (
              <div className="text-center">
                <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Preview not available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                  className="mt-2 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Name
              </label>
              <p className="text-sm text-gray-900">{file.originalName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Type
              </label>
              <p className="text-sm text-gray-900">{file.mimeType}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Size
              </label>
              <p className="text-sm text-gray-900">{formatFileSize(file.size)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uploaded
              </label>
              <p className="text-sm text-gray-900">
                {new Date(file.uploadedAt).toLocaleString()}
              </p>
            </div>
            
            {file.mimeType.startsWith('image/') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image..."
                  className="mb-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAltText}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Alt Text'}
                </Button>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={file.url}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(file.url)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="danger"
          onClick={onDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(file.url, '_blank')}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}
