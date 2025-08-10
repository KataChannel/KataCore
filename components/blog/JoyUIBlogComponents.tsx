'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Avatar, 
  Stack, 
  Divider,
  Link,
  IconButton,
  Badge,
  AspectRatio
} from '@/components/ui/joy-ui';
import { joyLayouts, joyAnimations, joyResponsive, joyClasses } from '@/components/ui/joy-ui';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  category: {
    name: string;
    color: string;
  };
  tags: string[];
  coverImage?: string;
  featured: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

/**
 * Modern Blog Card Component using Joy UI design
 */
export function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  const cardClass = variant === 'featured' 
    ? `${joyLayouts.card.interactive} ${joyClasses.shadow.lg}` 
    : joyLayouts.card.interactive;

  return (
    <Card className={cardClass}>
      {post.coverImage && (
        <AspectRatio ratio="16/9" className="mb-4">
          <img
            src={post.coverImage}
            alt={post.title}
            className="object-cover rounded-t-lg"
          />
        </AspectRatio>
      )}
      
      <CardContent>
        <Stack spacing={2}>
          {/* Category and Featured Badge */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip 
              color="primary" 
              variant="soft"
              size="sm"
              className={joyClasses.radius.md}
            >
              {post.category.name}
            </Chip>
            {post.featured && (
              <Badge badgeContent="Featured" color="warning" variant="soft">
                <Box />
              </Badge>
            )}
          </Stack>

          {/* Title */}
          <Typography 
            level="h4" 
            className={`${joyAnimations.transition.colors} hover:text-joy-primary cursor-pointer`}
          >
            {post.title}
          </Typography>

          {/* Excerpt */}
          <Typography 
            level="body-sm" 
            className="text-joy-neutral-600 dark:text-joy-neutral-400 line-clamp-3"
          >
            {post.excerpt}
          </Typography>

          <Divider />

          {/* Author and Meta */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={post.author.avatar} size="sm" />
              <Box>
                <Typography level="body-sm" fontWeight="500">
                  {post.author.name}
                </Typography>
                <Typography level="body-xs" className="text-joy-neutral-500">
                  {post.readTime} min read • {new Date(post.publishedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
            
            <Button 
              variant="outlined" 
              size="sm"
              className={joyAnimations.transition.all}
            >
              Read More
            </Button>
          </Stack>

          {/* Tags */}
          {post.tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {post.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  variant="soft"
                  size="sm"
                  color="neutral"
                  className={`${joyClasses.radius.sm} hover:bg-joy-neutral-200 dark:hover:bg-joy-neutral-700 cursor-pointer`}
                >
                  #{tag}
                </Chip>
              ))}
              {post.tags.length > 3 && (
                <Chip variant="soft" size="sm" color="neutral">
                  +{post.tags.length - 3}
                </Chip>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface BlogGridProps {
  posts: BlogPost[];
  loading?: boolean;
}

/**
 * Modern Blog Grid Layout using Joy UI
 */
export function BlogGrid({ posts, loading = false }: BlogGridProps) {
  if (loading) {
    return (
      <Box className={joyResponsive.grid.container}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className={joyLayouts.card.default}>
            <CardContent>
              <Stack spacing={2}>
                <Box className="h-4 bg-joy-neutral-200 dark:bg-joy-neutral-700 rounded animate-pulse" />
                <Box className="h-6 bg-joy-neutral-200 dark:bg-joy-neutral-700 rounded animate-pulse" />
                <Box className="h-16 bg-joy-neutral-200 dark:bg-joy-neutral-700 rounded animate-pulse" />
                <Box className="h-8 bg-joy-neutral-200 dark:bg-joy-neutral-700 rounded animate-pulse" />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className={joyLayouts.card.default}>
        <CardContent>
          <Stack spacing={2} alignItems="center" className="py-12">
            <Typography level="h4" className="text-joy-neutral-500">
              No blog posts found
            </Typography>
            <Typography level="body-sm" className="text-joy-neutral-400 text-center">
              Check back later for new content or try adjusting your filters.
            </Typography>
            <Button variant="soft" color="primary">
              View All Posts
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <Box className={joyResponsive.flex.col}>
      {/* Featured Post */}
      {featuredPost && (
        <Box className="mb-8">
          <Typography level="h3" className="mb-4 text-joy-neutral-900 dark:text-joy-neutral-100">
            Featured Article
          </Typography>
          <BlogCard post={featuredPost} variant="featured" />
        </Box>
      )}

      {/* Regular Posts Grid */}
      {regularPosts.length > 0 && (
        <Box>
          <Typography level="h3" className="mb-6 text-joy-neutral-900 dark:text-joy-neutral-100">
            Latest Articles
          </Typography>
          <Box className={`${joyResponsive.grid.container} ${joyResponsive.grid.cols3}`}>
            {regularPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface BlogHeroProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

/**
 * Modern Blog Hero Section using Joy UI
 */
export function BlogHero({ title, subtitle, backgroundImage }: BlogHeroProps) {
  return (
    <Box 
      className={`relative py-24 px-6 text-center ${joyClasses.radius.lg} overflow-hidden`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, var(--joy-palette-primary-500), var(--joy-palette-primary-700))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <Box className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <Box className="relative z-10">
        <Typography 
          level="h1" 
          className="text-white mb-4 font-bold tracking-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          {title}
        </Typography>
        <Typography 
          level="h4" 
          className="text-white/90 max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </Typography>
        
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="center" 
          className="mt-8"
        >
          <Button 
            size="lg" 
            variant="solid" 
            color="primary"
            className={`${joyAnimations.hover.scale} bg-white text-joy-primary hover:bg-joy-neutral-100`}
          >
            Explore Articles
          </Button>
          <Button 
            size="lg" 
            variant="outlined" 
            className={`${joyAnimations.hover.scale} border-white text-white hover:bg-white hover:text-joy-primary`}
          >
            Subscribe
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

interface BlogSidebarProps {
  categories: Array<{ name: string; count: number; }>;
  popularTags: Array<{ name: string; count: number; }>;
  recentPosts: Array<{ title: string; date: string; slug: string; }>;
}

/**
 * Modern Blog Sidebar using Joy UI
 */
export function BlogSidebar({ categories, popularTags, recentPosts }: BlogSidebarProps) {
  return (
    <Stack spacing={4}>
      {/* Categories */}
      <Card className={joyLayouts.card.default}>
        <CardContent>
          <Typography level="h4" className="mb-3">
            Categories
          </Typography>
          <Stack spacing={1}>
            {categories.map((category) => (
              <Box 
                key={category.name}
                className={`${joyResponsive.flex.between} py-2 px-3 rounded-joy-md hover:bg-joy-neutral-50 dark:hover:bg-joy-neutral-900/20 cursor-pointer ${joyAnimations.transition.colors}`}
              >
                <Typography level="body-sm">{category.name}</Typography>
                <Chip size="sm" variant="soft" color="neutral">
                  {category.count}
                </Chip>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card className={joyLayouts.card.default}>
        <CardContent>
          <Typography level="h4" className="mb-3">
            Popular Tags
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            {popularTags.map((tag) => (
              <Chip
                key={tag.name}
                variant="outlined"
                size="sm"
                className={`${joyAnimations.hover.scale} cursor-pointer`}
              >
                {tag.name} ({tag.count})
              </Chip>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card className={joyLayouts.card.default}>
        <CardContent>
          <Typography level="h4" className="mb-3">
            Recent Posts
          </Typography>
          <Stack spacing={2}>
            {recentPosts.map((post, index) => (
              <Box key={index}>
                <Link 
                  href={`/blog/${post.slug}`}
                  className={`block ${joyAnimations.transition.colors} hover:text-joy-primary`}
                >
                  <Typography level="body-sm" fontWeight="500" className="mb-1">
                    {post.title}
                  </Typography>
                  <Typography level="body-xs" className="text-joy-neutral-500">
                    {new Date(post.date).toLocaleDateString()}
                  </Typography>
                </Link>
                {index < recentPosts.length - 1 && <Divider className="mt-2" />}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default {
  BlogCard,
  BlogGrid,
  BlogHero,
  BlogSidebar,
};
