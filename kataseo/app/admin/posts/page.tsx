'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Button, Table, type TableColumn } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

// Types
interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    role: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Status badge component
const StatusBadge: React.FC<{ status: Post['status'] }> = ({ status }) => (
  <span
    className={cn(
      'px-2 py-1 text-xs font-medium rounded-full',
      status === 'PUBLISHED'
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    )}
  >
    {status}
  </span>
);

// Action buttons component
const ActionButtons: React.FC<{ post: Post; onDelete: (id: string) => void }> = ({ 
  post, 
  onDelete 
}) => (
  <div className="flex items-center gap-2">
    <Link href={`/admin/posts/${post.id}`}>
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </Link>
    <Button 
      variant="danger" 
      size="sm"
      onClick={() => onDelete(post.id)}
    >
      Delete
    </Button>
    {post.status === 'PUBLISHED' && (
      <Link href={`/blog/${post.slug}`} target="_blank">
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    )}
  </div>
);

export default function AdminPostsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  // Build API URL with filters
  const apiUrl = `/api/posts?page=${currentPage}&limit=${pageSize}${
    statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''
  }`;

  // Fetch data with SWR
  const { data, error, isLoading, mutate } = useSWR<PostsResponse>(apiUrl, fetcher);

  // Handle delete post
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh data
        mutate();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Table columns configuration
  const columns: TableColumn<Post>[] = [
    {
      key: 'title',
      title: 'Title',
      dataIndex: 'title',
      sortable: true,
      render: (value: unknown, record: Post) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{String(value)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">/{record.slug}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      sortable: true,
      render: (value: unknown) => <StatusBadge status={value as Post['status']} />,
      align: 'center',
    },
    {
      key: 'categories',
      title: 'Categories',
      render: (value: unknown, record: Post) => (
        <div className="flex flex-wrap gap-1">
          {record.categories.length > 0 ? (
            record.categories.map((category) => (
              <span
                key={category.id}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-300"
              >
                {category.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400">No categories</span>
          )}
        </div>
      ),
    },
    {
      key: 'author',
      title: 'Author',
      render: (value: unknown, record: Post) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">{record.author.email}</div>
          <div className="text-gray-500 dark:text-gray-400">{record.author.role}</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      dataIndex: 'createdAt',
      sortable: true,
      render: (value: unknown) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(String(value)).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, record: Post) => <ActionButtons post={record} onDelete={handleDelete} />,
      align: 'right',
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          Failed to load posts. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Posts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your blog posts and articles
          </p>
        </div>
        
        <Link href="/admin/posts/new">
          <Button>Create Post</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className={cn(
            'px-3 py-2 text-sm border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          )}
        >
          <option value="ALL">All Posts</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table
          columns={columns}
          data={data?.posts || []}
          loading={isLoading}
          pagination={
            data
              ? {
                  current: currentPage,
                  pageSize,
                  total: data.total,
                  onChange: handlePageChange,
                }
              : undefined
          }
          emptyText="No posts found. Create your first post to get started."
        />
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {data.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-semibold text-green-600">
              {data.posts.filter(p => p.status === 'PUBLISHED').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-semibold text-yellow-600">
              {data.posts.filter(p => p.status === 'DRAFT').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl font-semibold text-blue-600">
              {data.totalPages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Pages</div>
          </div>
        </div>
      )}
    </div>
  );
}
