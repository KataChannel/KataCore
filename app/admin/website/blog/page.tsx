'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, FolderOpen, Settings, Eye } from 'lucide-react';
import BlogPostList from '@/components/admin/blog/BlogPostList';
import BlogCategoryList from '@/components/admin/blog/BlogCategoryList';
import BlogPostForm from '@/components/admin/blog/BlogPostForm';
import BlogCategoryForm from '@/components/admin/blog/BlogCategoryForm';
import BlogSettings from '@/components/admin/blog/BlogSettings';

export default function BlogManagementPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleNewPost = () => {
    setEditingPost(null);
    setShowPostForm(true);
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCloseForm = () => {
    setShowPostForm(false);
    setShowCategoryForm(false);
    setEditingPost(null);
    setEditingCategory(null);
  };

  if (showPostForm) {
    return (
      <BlogPostForm
        post={editingPost}
        onClose={handleCloseForm}
        onSave={handleCloseForm}
      />
    );
  }

  if (showCategoryForm) {
    return (
      <BlogCategoryForm
        category={editingCategory}
        onClose={handleCloseForm}
        onSave={handleCloseForm}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý bài viết, danh mục và cài đặt blog
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => window.open('/site/blog', '_blank')}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Xem Blog</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng bài viết</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold">32</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bản nháp</p>
                <p className="text-2xl font-bold">13</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Danh mục</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="posts" className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Bài viết</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>Danh mục</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex space-x-2">
                {activeTab === 'posts' && (
                  <Button onClick={handleNewPost} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Thêm bài viết</span>
                  </Button>
                )}
                {activeTab === 'categories' && (
                  <Button onClick={handleNewCategory} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Thêm danh mục</span>
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="posts" className="mt-0">
              <BlogPostList onEdit={handleEditPost} />
            </TabsContent>

            <TabsContent value="categories" className="mt-0">
              <BlogCategoryList onEdit={handleEditCategory} />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <BlogSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
