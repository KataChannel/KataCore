'use client'

import { useState, useEffect } from 'react'
import { Button, Input } from '@/components/ui'

interface Category {
  id: string
  name: string
}

interface CategorySelectorProps {
  selectedCategory: string
  onChange: (categoryId: string) => void
  className?: string
}

export function CategorySelector({ selectedCategory, onChange, className }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Create new category
  const createCategory = async () => {
    if (!searchTerm.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: searchTerm.trim() })
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory])
        onChange(newCategory.id)
        setSearchTerm('')
        setShowDropdown(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Select category
  const selectCategory = (categoryId: string) => {
    onChange(categoryId)
    setShowDropdown(false)
    setSearchTerm('')
  }

  // Clear selection
  const clearSelection = () => {
    onChange('')
    setSearchTerm('')
  }

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCategoryObject = categories.find(cat => cat.id === selectedCategory)

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-10 rounded-md ${className}`}></div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected category display / search input */}
      <div className="relative">
        <Input
          value={showDropdown ? searchTerm : selectedCategoryObject?.name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
            if (!showDropdown) setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Select or create category..."
          className="w-full pr-20"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filteredCategories.length > 0) {
                selectCategory(filteredCategories[0].id)
              } else if (searchTerm.trim()) {
                createCategory()
              }
            } else if (e.key === 'Escape') {
              setShowDropdown(false)
              setSearchTerm('')
            }
          }}
        />
        
        {/* Clear button */}
        {selectedCategory && !showDropdown && (
          <button
            onClick={clearSelection}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            Clear
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowDropdown(false)
              setSearchTerm('')
            }}
          ></div>
          
          {/* Dropdown content */}
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              <div className="p-1">
                {filteredCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => selectCategory(category.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                      category.id === selectedCategory ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                    type="button"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  No categories found {searchTerm && `matching "${searchTerm}"`}
                </p>
                {searchTerm.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createCategory}
                    disabled={isCreating}
                    type="button"
                  >
                    {isCreating ? 'Creating...' : `Create "${searchTerm}"`}
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
