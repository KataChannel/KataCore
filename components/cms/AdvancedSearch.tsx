'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, Filter, FileText, Image, Globe, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchResult {
  id: string
  type: 'content' | 'media' | 'seo'
  title: string
  description: string
  url: string
  tags?: string[]
  lastModified: string
  relevanceScore: number
}

interface SearchFilters {
  type: 'all' | 'content' | 'media' | 'seo'
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year'
  status?: 'all' | 'published' | 'draft'
  tags: string[]
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'recent' | 'popular' | 'suggestion'
  icon?: React.ReactNode
}

export function AdvancedSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    dateRange: 'all',
    status: 'all',
    tags: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sample data
  const mockSuggestions: SearchSuggestion[] = [
    { id: '1', text: 'homepage content', type: 'popular', icon: <FileText className="w-4 h-4" /> },
    { id: '2', text: 'product images', type: 'popular', icon: <Image className="w-4 h-4" /> },
    { id: '3', text: 'seo meta tags', type: 'popular', icon: <Globe className="w-4 h-4" /> },
    { id: '4', text: 'blog posts', type: 'suggestion', icon: <FileText className="w-4 h-4" /> },
    { id: '5', text: 'gallery photos', type: 'suggestion', icon: <Image className="w-4 h-4" /> }
  ]

  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'content',
      title: 'Homepage Content',
      description: 'Main landing page content with hero section and featured products',
      url: '/content/homepage',
      tags: ['homepage', 'hero', 'featured'],
      lastModified: '2024-01-15T10:30:00Z',
      relevanceScore: 0.95
    },
    {
      id: '2',
      type: 'media',
      title: 'Product Hero Image',
      description: 'High-resolution product hero image for homepage banner',
      url: '/media/product-hero.jpg',
      tags: ['product', 'hero', 'banner'],
      lastModified: '2024-01-14T15:45:00Z',
      relevanceScore: 0.87
    },
    {
      id: '3',
      type: 'seo',
      title: 'Homepage SEO Settings',
      description: 'Meta tags, descriptions, and structured data for homepage',
      url: '/seo/homepage',
      tags: ['seo', 'meta', 'homepage'],
      lastModified: '2024-01-13T09:20:00Z',
      relevanceScore: 0.82
    }
  ]

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('cms_recent_searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Filter mock results based on query
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      
      // Apply filters
      let finalResults = filteredResults
      
      if (filters.type !== 'all') {
        finalResults = finalResults.filter(result => result.type === filters.type)
      }
      
      // Sort by relevance score
      finalResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
      
      setResults(finalResults)
      
      // Save to recent searches
      const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem('cms_recent_searches', JSON.stringify(newRecentSearches))
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    
    if (value.trim()) {
      // Show suggestions based on input
      const filtered = mockSuggestions.filter(s =>
        s.text.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setResults([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'media':
        return <Image className="w-4 h-4 text-purple-600" />
      case 'seo':
        return <Globe className="w-4 h-4 text-green-600" />
      default:
        return <Search className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Search</h1>
        <p className="text-gray-600">Find content, media, and SEO data across your CMS</p>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="relative mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search content, media, SEO data..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-20 py-3 text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
            {query && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (query || recentSearches.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Suggestions</div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                  >
                    {suggestion.icon}
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Types</option>
                <option value="content">Content</option>
                <option value="media">Media</option>
                <option value="seo">SEO</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Status Filter */}
            {filters.type === 'content' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Searching...</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Search Results ({results.length})</h2>
            <Button variant="outline" size="sm" onClick={() => handleSearch(query)}>
              Refresh
            </Button>
          </div>

          {results.map((result) => (
            <div key={result.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                      <a href={result.url}>{result.title}</a>
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {result.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{result.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Modified {formatDate(result.lastModified)}</span>
                    <span>•</span>
                    <span>Relevance: {Math.round(result.relevanceScore * 100)}%</span>
                    {result.tags && result.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {result.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                          {result.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">+{result.tags.length - 3} more</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={clearSearch}>
            Clear Search
          </Button>
        </div>
      )}

      {!query && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Start Searching</h3>
          <p className="text-gray-500">
            Enter a search term to find content, media, and SEO data
          </p>
        </div>
      )}
    </div>
  )
}
