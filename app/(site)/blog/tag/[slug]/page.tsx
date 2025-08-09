'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  Clock,
  Tag,
  Hash,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const GET_TAG_POSTS = gql`
  query GetTagPosts(
    $slug: String!
    $page: Int!
    $limit: Int!
    $search: String
    $sortBy: String
  ) {
    blogTag(slug: $slug) {
      id
      name
      slug
      description
      color
      postCount
    }
    blogPosts(
      tagSlug: $slug
      page: $page
      limit: $limit
      search: $search
      sortBy: $sortBy
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

const GET_ALL_TAGS = gql`
  query GetAllTags {
    blogTags(isActive: true) {
      id
      name
      slug
      color
      postCount
    }
  }
`;

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data, loading, error } = useQuery(GET_TAG_POSTS, {
    variables: {
      slug,
      page: currentPage,
      limit: 12,
      search: search || undefined,
      sortBy,
    },
  });

  const { data: tagsData } = useQuery(GET_ALL_TAGS);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const resetSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.blogTag) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Không tìm thấy thẻ
          </p>
          <Button onClick={() => router.push('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Blog
          </Button>
        </div>
      </div>
    );
  }

  const tag = data.blogTag;
  const posts = data.blogPosts?.posts || [];
  const pagination = data.blogPosts?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tag Header */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden"
        style={{
          background: tag.color ? `linear-gradient(135deg, ${tag.color}, ${tag.color}dd)` : undefined,
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Button
            variant="ghost"
            onClick={() => router.push('/blog')}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Blog
          </Button>

          <div className="flex items-center space-x-3 mb-4">
            <Hash className="w-8 h-8" />
            <Badge className="bg-white/20 text-white border-white/30">
              {tag.postCount} bài viết
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            #{tag.name}
          </h1>

          {tag.description && (
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl">
              {tag.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative md:col-span-2">
                  <Input
                    type="text"
                    placeholder="Tìm kiếm trong thẻ..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </form>

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

                  {search && (
                    <Button variant="outline" onClick={resetSearch}>
                      Xóa tìm kiếm
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post: any) => (
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
                          <div 
                            className="w-full h-48 flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${post.category?.color || '#6b7280'}, ${post.category?.color || '#6b7280'}aa)`,
                            }}
                          >
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

                        {/* Other Tags */}
                        {post.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags
                              .filter((t: any) => t.slug !== slug)
                              .slice(0, 3)
                              .map((otherTag: any) => (
                                <Badge
                                  key={otherTag.id}
                                  variant="outline"
                                  style={{ borderColor: otherTag.color, color: otherTag.color }}
                                  className="text-xs"
                                >
                                  {otherTag.name}
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
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      disabled={!pagination.hasPrev}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Trước
                    </Button>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Trang {pagination.page} / {pagination.totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      disabled={!pagination.hasNext}
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
                  {search 
                    ? 'Không có bài viết nào phù hợp với từ khóa tìm kiếm.'
                    : 'Thẻ này chưa có bài viết nào.'
                  }
                </p>
                {search && (
                  <Button onClick={resetSearch}>
                    Xóa tìm kiếm
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tag Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Thông tin thẻ
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tổng bài viết:
                    </span>
                    <Badge variant="secondary">
                      {tag.postCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Màu thẻ:
                    </span>
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: tag.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Tags */}
            {tagsData?.blogTags?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Thẻ khác
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tagsData.blogTags
                      .filter((t: any) => t.slug !== slug)
                      .slice(0, 20)
                      .map((otherTag: any) => (
                        <Link key={otherTag.id} href={`/blog/tag/${otherTag.slug}`}>
                          <Badge
                            style={{ backgroundColor: otherTag.color }}
                            className="text-white hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            {otherTag.name} ({otherTag.postCount})
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
