'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const GET_BLOG_POSTS = gql`
  query GetBlogPosts($skip: Int, $take: Int, $search: String, $status: String, $categoryId: String) {
    blogPosts(skip: $skip, take: $take, search: $search, status: $status, categoryId: $categoryId) {
      id
      title
      slug
      excerpt
      status
      visibility
      publishedAt
      views
      likes
      isFeatured
      allowComments
      createdAt
      updatedAt
      author {
        id
        name
        email
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        color
      }
      commentsCount
    }
  }
`;

const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories(isActive: true) {
      id
      name
      slug
    }
  }
`;

const DELETE_BLOG_POST = gql`
  mutation DeleteBlogPost($id: String!) {
    deleteBlogPost(id: $id) {
      id
    }
  }
`;

const LIKE_BLOG_POST = gql`
  mutation LikeBlogPost($id: String!) {
    likeBlogPost(id: $id) {
      id
      likes
    }
  }
`;

interface BlogPostListProps {
  onEdit: (post: any) => void;
}

export default function BlogPostList({ onEdit }: BlogPostListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: postsData, loading, error, refetch } = useQuery(GET_BLOG_POSTS, {
    variables: {
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      categoryId: categoryFilter || undefined,
    },
  });

  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES);

  const [deleteBlogPost] = useMutation(DELETE_BLOG_POST, {
    onCompleted: () => {
      refetch();
    },
  });

  const [likeBlogPost] = useMutation(LIKE_BLOG_POST);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteBlogPost({ variables: { id } });
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleLike = async (id: string) => {
    try {
      await likeBlogPost({ variables: { id } });
      refetch();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Đã xuất bản</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Bản nháp</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Đã lên lịch</Badge>;
      case 'archived':
        return <Badge className="bg-orange-100 text-orange-800">Lưu trữ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Lỗi khi tải danh sách bài viết: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  const posts = postsData?.blogPosts || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Bộ lọc</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả trạng thái</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả danh mục</SelectItem>
                {categoriesData?.blogCategories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thống kê</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {post.title}
                        </span>
                        {post.isFeatured && (
                          <Badge variant="outline" className="text-xs">
                            Nổi bật
                          </Badge>
                        )}
                      </div>
                      {post.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>/{post.slug}</span>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{post.tags.length} tags</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{post.author?.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {post.category ? (
                      <Badge variant="outline">{post.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400">Chưa phân loại</span>
                    )}
                  </TableCell>

                  <TableCell>{getStatusBadge(post.status)}</TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(post.createdAt), 'dd/MM/yyyy', {
                            locale: vi,
                          })}
                        </span>
                      </div>
                      {post.publishedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Xuất bản: {format(new Date(post.publishedAt), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(`/site/blog/${post.slug}`, '_blank')
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem bài viết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLike(post.id)}>
                          <Heart className="mr-2 h-4 w-4" />
                          Thích ({post.likes || 0})
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {posts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Không có bài viết nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {posts.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, posts.length)} của {posts.length} bài viết
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={posts.length < itemsPerPage}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
