'use client';

import React, { Suspense } from 'react';
import { Box, Grid } from '@/components/ui/joy-ui';
import { BlogHero, BlogGrid, BlogSidebar } from '@/components/blog/JoyUIBlogComponents';

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Sample data
const samplePosts = [
  {
    id: '1',
    title: "Joy UI Integration Complete",
    excerpt: "Successfully integrated Joy UI with Tailwind CSS for a modern design system.",
    content: "Full content about Joy UI integration...",
    author: {
      name: "Developer",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    publishedAt: "2024-01-15T10:00:00Z",
    readTime: 5,
    category: {
      name: "Development",
      color: "primary" as const
    },
    tags: ["React", "Joy UI", "Tailwind"],
    coverImage: "/placeholder-blog-1.jpg",
    featured: true
  },
  {
    id: '2',
    title: "Modern Design Patterns",
    excerpt: "Exploring the latest design patterns in Joy UI and Material-UI ecosystems.",
    content: "Full content about design patterns...",
    author: {
      name: "Designer",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    publishedAt: "2024-01-14T10:00:00Z",
    readTime: 7,
    category: {
      name: "Design",
      color: "success" as const
    },
    tags: ["Design", "UI/UX", "Material-UI"],
    coverImage: "/placeholder-blog-2.jpg",
    featured: false
  },
  {
    id: '3',
    title: "Performance Optimization",
    excerpt: "Tips and tricks for optimizing React applications with Joy UI components.",
    content: "Full content about performance...",
    author: {
      name: "DevOps",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    publishedAt: "2024-01-13T10:00:00Z",
    readTime: 6,
    category: {
      name: "Performance",
      color: "warning" as const
    },
    tags: ["Performance", "React", "Optimization"],
    coverImage: "/placeholder-blog-3.jpg",
    featured: false
  }
];

const sampleCategories = [
  { name: "Development", count: 12 },
  { name: "Design", count: 8 },
  { name: "Performance", count: 5 },
  { name: "Tutorial", count: 15 }
];

const sampleTags = [
  { name: "React", count: 25 },
  { name: "Joy UI", count: 10 },
  { name: "Tailwind", count: 8 },
  { name: "Next.js", count: 12 },
  { name: "TypeScript", count: 18 }
];

const sampleRecentPosts = [
  { title: "Joy UI Integration Complete", date: "2024-01-15", slug: "joy-ui-integration" },
  { title: "Modern Design Patterns", date: "2024-01-14", slug: "modern-design-patterns" }
];

export default function JoyUIBlogDemo() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Box className="max-w-7xl mx-auto">
          <BlogHero 
            title="Joy UI Blog Demo" 
            subtitle="Discover the power of Joy UI combined with Tailwind CSS"
          />
          
          <Grid container spacing={4} className="py-8 px-4">
            <Grid xs={12} md={8}>
              <BlogGrid posts={samplePosts} />
            </Grid>
            
            <Grid xs={12} md={4}>
              <BlogSidebar 
                categories={sampleCategories}
                popularTags={sampleTags}
                recentPosts={sampleRecentPosts}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </Suspense>
  );
}
