'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  Upload,
  X,
  Plus,
  Calendar,
  Globe,
  Lock,
  FileText,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';

const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories(isActive: true) {
      id
      name
      slug
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
    }
  }
`;

const CREATE_BLOG_POST = gql`
  mutation CreateBlogPost($input: BlogPostCreateInput!) {
    createBlogPost(input: $input) {
      id
      title
      slug
      status
    }
  }
`;

const UPDATE_BLOG_POST = gql`
  mutation UpdateBlogPost($id: String!, $input: BlogPostUpdateInput!) {
    updateBlogPost(id: $id, input: $input) {
      id
      title
      slug
      status
    }
  }
`;

interface BlogPostFormProps {
  post?: any;
  onClose: () => void;
  onSave: () => void;
}

export default function BlogPostForm({ post, onClose, onSave }: BlogPostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'draft',
    visibility: 'public',
    publishedAt: '',
    categoryId: '',
    tagIds: [] as string[],
    isFeatured: false,
    allowComments: true,
  });

  const [activeTab, setActiveTab] = useState('content');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: categoriesData } = useQuery(GET_BLOG_CATEGORIES);
  const { data: tagsData } = useQuery(GET_BLOG_TAGS);

  const [createBlogPost, { loading: creating }] = useMutation(CREATE_BLOG_POST, {
    onCompleted: () => {
      onSave();
    },
  });

  const [updateBlogPost, { loading: updating }] = useMutation(UPDATE_BLOG_POST, {
    onCompleted: () => {
      onSave();
    },
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featuredImage: post.featuredImage || '',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        metaKeywords: post.metaKeywords || '',
        status: post.status || 'draft',
        visibility: post.visibility || 'public',
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
        categoryId: post.category?.id || '',
        tagIds: post.tags?.map((tag: any) => tag.id) || [],
        isFeatured: post.isFeatured || false,
        allowComments: post.allowComments !== undefined ? post.allowComments : true,
      });
      setSelectedTags(post.tags?.map((tag: any) => tag.id) || []);
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
      metaTitle: prev.metaTitle || value,
    }));
  };

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newSelectedTags);
    setFormData(prev => ({ ...prev, tagIds: newSelectedTags }));
  };

  const handleSubmit = async (status?: string) => {
    try {
      const submitData = {
        ...formData,
        status: status || formData.status,
        publishedAt: status === 'published' && !formData.publishedAt 
          ? new Date().toISOString()
          : formData.publishedAt || null,
      };

      if (post) {
        await updateBlogPost({
          variables: {
            id: post.id,
            input: submitData,
          },
        });
      } else {
        await createBlogPost({
          variables: {
            input: submitData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.');
    }
  };

  const isLoading = creating || updating;

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
                  {post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h1>
                <p className="text-sm text-gray-500">
                  {formData.slug ? `/${formData.slug}` : 'Chưa có slug'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu nháp
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xuất bản
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Nội dung</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tiêu đề bài viết *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Nhập tiêu đề bài viết..."
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Slug URL
                      </label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="duong-dan-url-bai-viet"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tóm tắt
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Tóm tắt ngắn gọn về bài viết..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nội dung bài viết *
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Viết nội dung bài viết ở đây..."
                        rows={20}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Hỗ trợ Markdown. Sử dụng ## cho tiêu đề, **text** cho in đậm, *text* cho in nghiêng.
                      </p>
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
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ảnh đại diện
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        {formData.featuredImage ? (
                          <div className="space-y-4">
                            <img
                              src={formData.featuredImage}
                              alt="Featured"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <Button
                              variant="outline"
                              onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Xóa ảnh
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <Button variant="outline">
                                <Upload className="w-4 h-4 mr-2" />
                                Tải lên ảnh
                              </Button>
                              <p className="text-sm text-gray-500 mt-2">
                                Hoặc nhập URL ảnh
                              </p>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                value={formData.featuredImage}
                                onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                                className="mt-2"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Cài đặt xuất bản</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trạng thái
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="scheduled">Lên lịch</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hiển thị
                  </label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>Công khai</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>Riêng tư</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thời gian xuất bản
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Bài viết nổi bật</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.allowComments}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Cho phép bình luận</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Danh mục</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.blogCategories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Thẻ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tagsData?.blogTags?.map((tag: any) => (
                    <label key={tag.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        className="rounded"
                      />
                      <Badge 
                        style={{ backgroundColor: tag.color || '#e5e7eb' }}
                        className="text-white"
                      >
                        {tag.name}
                      </Badge>
                    </label>
                  ))}
                  
                  {(!tagsData?.blogTags || tagsData.blogTags.length === 0) && (
                    <p className="text-sm text-gray-500">Chưa có thẻ nào</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
