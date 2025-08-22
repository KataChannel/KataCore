'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button, Input } from '@/components/ui'

interface Tag {
  id: string
  name: string
}

interface TagSelectorProps {
  selectedTags: string[]
  onChange: (tagIds: string[]) => void
  className?: string
}

export function TagSelector({ selectedTags, onChange, className }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags')
        if (response.ok) {
          const data = await response.json()
          setTags(data)
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  // Create new tag
  const createTag = async () => {
    if (!searchTerm.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: searchTerm.trim() })
      })

      if (response.ok) {
        const newTag = await response.json()
        setTags([...tags, newTag])
        onChange([...selectedTags, newTag.id])
        setSearchTerm('')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  // Remove tag
  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId))
  }

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  )

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id))

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
        <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selected tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTagObjects.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                className="hover:bg-blue-200 rounded-full p-0.5"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search or create tags..."
          className="w-full"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filteredTags.length > 0) {
                toggleTag(filteredTags[0].id)
                setSearchTerm('')
              } else if (searchTerm.trim()) {
                createTag()
              }
            }
          }}
        />
      </div>

      {/* Tag suggestions */}
      {searchTerm && (
        <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
          {filteredTags.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredTags.slice(0, 10).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    toggleTag(tag.id)
                    setSearchTerm('')
                  }}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                  type="button"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center">
              <p className="text-sm text-gray-500 mb-2">
                No tags found matching "{searchTerm}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={createTag}
                disabled={isCreating}
                type="button"
              >
                {isCreating ? 'Creating...' : `Create "${searchTerm}"`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Available tags (when not searching) */}
      {!searchTerm && (
        <div className="border border-gray-200 rounded-md p-2 max-h-48 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-2 font-medium">Available tags:</div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tags available. Create one above!</p>
          )}
        </div>
      )}
    </div>
  )
}
