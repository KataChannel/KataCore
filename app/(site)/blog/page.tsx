'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Folder,
  Clock,
  Tag,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const GET_BLOG_POSTS = gql`
  query GetBlogPosts(
    $page: Int!
    $limit: Int!
    $search: String
    $categoryId: String
    $tagId: String
    $featured: Boolean
  ) {
    blogPosts(
      page: $page
      limit: $limit
      search: $search
      categoryId: $categoryId
      tagId: $tagId
      featured: $featured
      status: published
    ) {
      posts {
        id
        title
        slug
        excerpt
        featuredImage
        publishedAt
        readTime
        viewCount
        likeCount
        commentCount
        isFeatured
        author {
          id
          name
          avatar
        }
        category {
          id
          name
          slug
          color
        }
        tags {
          id
          name
          slug
          color
        }
      }
      pagination {
        page
        limit
        total
        totalPages
        hasNext
        hasPrev
      }
    }
  }
`;

const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories(isActive: true) {
      id
      name
      slug
      color
      postCount
    }
  }
`;

const GET_BLOG_TAGS = gql`
  query GetBlogTags {
    blogTags(isActive: true) {
      id
      name
      slug
      color
      postCount
    }
  }
`;

const GET_FEATURED_POSTS = gql`
  query GetFeaturedPosts {
    blogPosts(featured: true, status: published, limit: 3) {
      posts {
        id
        title
        slug
        excerpt
        featuredImage
        publishedAt
        category {
          id
          name
          color
        }
      }
    }
  }
`;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data: postsData, loading: postsLoading } = useQuery(GET_BLOG_POSTS, {
    variables: {
      page: currentPage,
      limit: 12,
      search: search || undefined,
      categoryId: selectedCategory || undefined,
      tagId: selectedTag || undefined,
    },
  });

  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES);
  const { data: tagsData } = useQuery(GET_BLOG_TAGS);
  const { data: featuredData } = useQuery(GET_FEATURED_POSTS);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedTag('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Blog & Tin tức
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Khám phá những bài viết hữu ích, tin tức mới nhất và kiến thức bổ ích từ chúng tôi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredData?.blogPosts?.posts?.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bài viết nổi bật
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredData.blogPosts.posts.map((post: any) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge
                        style={{ backgroundColor: post.category.color }}
                        className="text-white"
                      >
                        {post.category.name}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDistanceToNow(new Date(post.publishedAt), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex justify-between items-center">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                      >
                        Đọc thêm →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </form>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Folder className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả danh mục</SelectItem>
                {categoriesData?.blogCategories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name} ({category.postCount})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tất cả thẻ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả thẻ</SelectItem>
                {tagsData?.blogTags?.map((tag: any) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <Badge
                      style={{ backgroundColor: tag.color }}
                      className="text-white"
                    >
                      {tag.name} ({tag.postCount})
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="trending">Xu hướng</SelectItem>
                </SelectContent>
              </Select>

              {(search || selectedCategory || selectedTag) && (
                <Button variant="outline" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {postsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : postsData?.blogPosts?.posts?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {postsData.blogPosts.posts.map((post: any) => (
                    <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            width={400}
                            height={200}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="absolute top-4 left-4">
                          <Badge
                            style={{ backgroundColor: post.category.color }}
                            className="text-white"
                          >
                            {post.category.name}
                          </Badge>
                        </div>

                        {post.isFeatured && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-yellow-500 text-white">
                              Nổi bật
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(post.publishedAt), { 
                                addSuffix: true, 
                                locale: vi 
                              })}
                            </span>
                          </div>
                          
                          {post.readTime && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.readTime} phút đọc</span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                          <Link 
                            href={`/blog/${post.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag: any) => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                style={{ borderColor: tag.color, color: tag.color }}
                                className="text-xs"
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.viewCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.likeCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.commentCount || 0}</span>
                            </div>
                          </div>

                          <Link
                            href={`/blog/${post.slug}`}
                            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                          >
                            Đọc thêm →
                          </Link>
                        </div>

                        {/* Author */}
                        {post.author && (
                          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {post.author.avatar ? (
                              <Image
                                src={post.author.avatar}
                                alt={post.author.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-600" />
                              </div>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {post.author.name}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {postsData?.blogPosts?.pagination && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      disabled={!postsData.blogPosts.pagination.hasPrev}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Trước
                    </Button>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Trang {postsData.blogPosts.pagination.page} / {postsData.blogPosts.pagination.totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      disabled={!postsData.blogPosts.pagination.hasNext}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Tiếp
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Không tìm thấy bài viết
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Không có bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.
                </p>
                <Button onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            {categoriesData?.blogCategories?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Danh mục
                  </h3>
                  <div className="space-y-2">
                    {categoriesData.blogCategories.map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/blog/category/${category.slug}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {category.postCount}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popular Tags */}
            {tagsData?.blogTags?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Thẻ phổ biến
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tagsData.blogTags.slice(0, 20).map((tag: any) => (
                      <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                        <Badge
                          style={{ backgroundColor: tag.color }}
                          className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
