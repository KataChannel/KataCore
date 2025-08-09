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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  FileText,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories($search: String, $isActive: Boolean) {
    blogCategories(search: $search, isActive: $isActive) {
      id
      name
      slug
      description
      image
      isActive
      createdAt
      updatedAt
      postsCount
    }
  }
`;

const DELETE_BLOG_CATEGORY = gql`
  mutation DeleteBlogCategory($id: String!) {
    deleteBlogCategory(id: $id) {
      id
    }
  }
`;

const UPDATE_BLOG_CATEGORY = gql`
  mutation UpdateBlogCategory($id: String!, $input: BlogCategoryUpdateInput!) {
    updateBlogCategory(id: $id, input: $input) {
      id
      isActive
    }
  }
`;

interface BlogCategoryListProps {
  onEdit: (category: any) => void;
}

export default function BlogCategoryList({ onEdit }: BlogCategoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: categoriesData, loading, error, refetch } = useQuery(GET_BLOG_CATEGORIES, {
    variables: {
      search: searchTerm || undefined,
      isActive: showInactive ? undefined : true,
    },
  });

  const [deleteBlogCategory] = useMutation(DELETE_BLOG_CATEGORY, {
    onCompleted: () => {
      refetch();
    },
  });

  const [updateBlogCategory] = useMutation(UPDATE_BLOG_CATEGORY, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả bài viết trong danh mục sẽ bị ảnh hưởng.')) {
      try {
        await deleteBlogCategory({ variables: { id } });
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Không thể xóa danh mục. Vui lòng thử lại sau.');
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateBlogCategory({
        variables: {
          id,
          input: { isActive: !isActive }
        }
      });
    } catch (error) {
      console.error('Error updating category:', error);
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
        <p className="text-red-600">Lỗi khi tải danh sách danh mục: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  const categories = categoriesData?.blogCategories || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5" />
              <span>Danh mục Blog</span>
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                <span>Hiển thị danh mục đã tắt</span>
              </label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số bài viết</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            /{category.slug}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-xs">
                      {category.description ? (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </p>
                      ) : (
                        <span className="text-gray-400 text-sm">Chưa có mô tả</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{category.postsCount || 0}</span>
                      <span className="text-sm text-gray-500">bài viết</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge 
                      className={category.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                      }
                    >
                      {category.isActive ? 'Hoạt động' : 'Đã tắt'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(category.createdAt), 'dd/MM/yyyy', {
                            locale: vi,
                          })}
                        </span>
                      </div>
                      {category.updatedAt !== category.createdAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Cập nhật: {format(new Date(category.updatedAt), 'dd/MM/yyyy')}
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
                            window.open(`/site/blog/category/${category.slug}`, '_blank')
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem danh mục
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleActive(category.id, category.isActive)}
                        >
                          {category.isActive ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Tắt danh mục
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(category.id)}
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

          {categories.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có danh mục nào</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Thử tìm kiếm với từ khóa khác
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {categories.length > 0 && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>
            Hiển thị {categories.length} danh mục
          </p>
          <div className="flex space-x-4">
            <span>
              Hoạt động: {categories.filter((c: any) => c.isActive).length}
            </span>
            <span>
              Đã tắt: {categories.filter((c: any) => !c.isActive).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
