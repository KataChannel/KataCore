'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, Calendar, Loader2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchResult {
  id: string
  title: string
  excerpt?: string
  slug: string
  type: 'post' | 'category' | 'tag'
  relevanceScore?: number
  searchHighlights?: string[]
  createdAt: string
  author?: {
    email: string
  }
  categories?: Array<{ name: string; slug: string }>
  tags?: Array<{ name: string; slug: string }>
}

interface SearchResults {
  results: SearchResult[] | {
    posts: SearchResult[]
    categories: SearchResult[]
    tags: SearchResult[]
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  total?: {
    posts: number
    categories: number
    tags: number
  }
}

interface SearchProps {
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  showFilters?: boolean
  defaultType?: 'posts' | 'categories' | 'tags' | 'all'
}

export function SearchComponent({ 
  onResultSelect, 
  placeholder = "Search posts, categories, tags...",
  showFilters = true,
  defaultType = 'all'
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState({
    type: defaultType,
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
    sortBy: 'relevance' as 'relevance' | 'date' | 'title',
    dateRange: '' as '' | 'day' | 'week' | 'month' | 'year'
  })
  const [page, setPage] = useState(1)
  
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search function
  const performSearch = async (searchQuery: string, currentPage: number = 1) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults(null)
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: filters.type,
        status: filters.status,
        page: currentPage.toString(),
        limit: '10',
        sortBy: filters.sortBy,
        ...(filters.dateRange && { dateRange: filters.dateRange })
      })

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Get search suggestions
  const getSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
      
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      setSuggestions([])
    }
  }

  // Effect for searching
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, 1)
      setPage(1)
    } else {
      setResults(null)
    }
  }, [debouncedQuery, filters])

  // Effect for suggestions
  useEffect(() => {
    if (query && showSuggestions) {
      getSuggestions(query)
    } else {
      setSuggestions([])
    }
  }, [query, showSuggestions])

  // Handle clicks outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery('')
    setResults(null)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    performSearch(query, newPage)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderResults = () => {
    if (!results) return null

    if (Array.isArray(results.results)) {
      // Single type results
      return (
        <div className="space-y-3">
          {results.results.map((result) => (
            <ResultItem 
              key={result.id} 
              result={result} 
              onClick={handleResultClick}
            />
          ))}
        </div>
      )
    } else {
      // Mixed results
      const { posts, categories, tags } = results.results
      
      return (
        <div className="space-y-4">
          {posts && posts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Posts ({results.total?.posts || 0})
              </h3>
              <div className="space-y-2">
                {posts.slice(0, 5).map((result) => (
                  <ResultItem 
                    key={result.id} 
                    result={result} 
                    onClick={handleResultClick}
                  />
                ))}
              </div>
            </div>
          )}
          
          {categories && categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Categories ({results.total?.categories || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {result.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {tags && tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tags ({results.total?.tags || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    {result.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        {isLoading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="posts">Posts</option>
            <option value="categories">Categories</option>
            <option value="tags">Tags</option>
          </select>
          
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any time</option>
            <option value="day">Last day</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
            <option value="year">Last year</option>
          </select>
        </div>
      )}

      {/* Suggestions and Results */}
      {(showSuggestions && (suggestions.length > 0 || results)) && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {suggestions.length > 0 && !results && (
            <div className="p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {results && (
            <div className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Search Results ({results.pagination.total} total)
              </div>
              {renderResults()}
              
              {/* Pagination */}
              {results.pagination.pages > 1 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Page {results.pagination.page} of {results.pagination.pages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= results.pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Result item component
function ResultItem({ 
  result, 
  onClick 
}: { 
  result: SearchResult
  onClick: (result: SearchResult) => void 
}) {
  return (
    <button
      onClick={() => onClick(result)}
      className="block w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {result.searchHighlights?.[0] ? (
              <span dangerouslySetInnerHTML={{ __html: result.searchHighlights[0] }} />
            ) : (
              result.title
            )}
          </h4>
          
          {result.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {result.searchHighlights?.[1] ? (
                <span dangerouslySetInnerHTML={{ __html: result.searchHighlights[1] }} />
              ) : (
                result.excerpt
              )}
            </p>
          )}
          
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="capitalize">{result.type}</span>
            {result.createdAt && (
              <span>{new Date(result.createdAt).toLocaleDateString()}</span>
            )}
            {result.author && (
              <span>by {result.author.email}</span>
            )}
            {result.relevanceScore && (
              <span>Score: {result.relevanceScore}</span>
            )}
          </div>
          
          {/* Categories and Tags */}
          {(result.categories || result.tags) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {result.categories?.map((cat) => (
                <span
                  key={cat.slug}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {cat.name}
                </span>
              ))}
              {result.tags?.map((tag) => (
                <span
                  key={tag.slug}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
