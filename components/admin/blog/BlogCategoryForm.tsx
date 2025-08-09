'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Folder,
  Hash,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';

const CREATE_BLOG_CATEGORY = gql`
  mutation CreateBlogCategory($input: BlogCategoryCreateInput!) {
    createBlogCategory(input: $input) {
      id
      name
      slug
      isActive
    }
  }
`;

const UPDATE_BLOG_CATEGORY = gql`
  mutation UpdateBlogCategory($id: String!, $input: BlogCategoryUpdateInput!) {
    updateBlogCategory(id: $id, input: $input) {
      id
      name
      slug
      isActive
    }
  }
`;

interface BlogCategoryFormProps {
  category?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function BlogCategoryForm({ category, onClose, onSave }: BlogCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    image: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isActive: true,
    sortOrder: 0,
  });

  const [activeTab, setActiveTab] = useState('general');

  const [createBlogCategory, { loading: creating }] = useMutation(CREATE_BLOG_CATEGORY, {
    onCompleted: () => {
      onSave();
    },
  });

  const [updateBlogCategory, { loading: updating }] = useMutation(UPDATE_BLOG_CATEGORY, {
    onCompleted: () => {
      onSave();
    },
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        color: category.color || '#3b82f6',
        icon: category.icon || '',
        image: category.image || '',
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        metaKeywords: category.metaKeywords || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0,
      });
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: prev.slug || generateSlug(value),
      metaTitle: prev.metaTitle || value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      if (category) {
        await updateBlogCategory({
          variables: {
            id: category.id,
            input: formData,
          },
        });
      } else {
        await createBlogCategory({
          variables: {
            input: formData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.');
    }
  };

  const isLoading = creating || updating;

  const colorOptions = [
    { value: '#3b82f6', label: 'Xanh dương', preview: '#3b82f6' },
    { value: '#ef4444', label: 'Đỏ', preview: '#ef4444' },
    { value: '#10b981', label: 'Xanh lá', preview: '#10b981' },
    { value: '#f59e0b', label: 'Cam', preview: '#f59e0b' },
    { value: '#8b5cf6', label: 'Tím', preview: '#8b5cf6' },
    { value: '#06b6d4', label: 'Xanh ngọc', preview: '#06b6d4' },
    { value: '#ec4899', label: 'Hồng', preview: '#ec4899' },
    { value: '#6b7280', label: 'Xám', preview: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
                </h1>
                <p className="text-sm text-gray-500">
                  {formData.slug ? `/blog/category/${formData.slug}` : 'Chưa có slug'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {category ? 'Cập nhật' : 'Tạo danh mục'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">
                  <Folder className="w-4 h-4 mr-2" />
                  Thông tin chung
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Hash className="w-4 h-4 mr-2" />
                  Giao diện
                </TabsTrigger>
                <TabsTrigger value="seo">
                  <Globe className="w-4 h-4 mr-2" />
                  SEO
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tên danh mục *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Nhập tên danh mục..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slug URL
                      </label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="duong-dan-url-danh-muc"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả về danh mục này..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Thứ tự sắp xếp
                      </label>
                      <Input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Số nhỏ hơn sẽ hiển thị trước
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Trạng thái
                      </label>
                      <Select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Màu sắc danh mục
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          className={`
                            flex items-center space-x-2 p-3 rounded-lg border-2 transition-all
                            ${formData.color === color.value 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color.preview }}
                          />
                          <span className="text-sm">{color.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Màu tùy chỉnh
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-10 border border-gray-300 rounded-md"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon (Font Awesome class)
                    </label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="fa-folder, fa-tag, fa-star..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ví dụ: fa-folder, fa-star, fa-heart
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ảnh danh mục
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {formData.image ? (
                        <div className="space-y-4">
                          <img
                            src={formData.image}
                            alt="Category"
                            className="max-h-32 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Xóa ảnh
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <Button type="button" variant="outline">
                              <Upload className="w-4 h-4 mr-2" />
                              Tải lên ảnh
                            </Button>
                            <p className="text-sm text-gray-500 mt-2">
                              Hoặc nhập URL ảnh
                            </p>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={formData.image}
                              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Tiêu đề hiển thị trên Google (60 ký tự)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaTitle.length}/60 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Mô tả hiển thị trên Google (160 ký tự)"
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.metaDescription.length}/160 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Meta Keywords
                    </label>
                    <Input
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                      placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Preview SEO
                    </h4>
                    <div className="space-y-2">
                      <div className="text-blue-600 dark:text-blue-400 text-lg">
                        {formData.metaTitle || formData.name || 'Tên danh mục'}
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-sm">
                        yoursite.com/blog/category/{formData.slug || 'category-slug'}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {formData.metaDescription || formData.description || 'Mô tả danh mục sẽ hiển thị ở đây...'}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
