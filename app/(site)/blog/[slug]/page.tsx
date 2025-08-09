'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Clock,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';

const GET_BLOG_POST = gql`
  query GetBlogPost($slug: String!) {
    blogPost(slug: $slug) {
      id
      title
      slug
      content
      excerpt
      featuredImage
      publishedAt
      updatedAt
      readTime
      viewCount
      likeCount
      commentCount
      isLiked
      metaTitle
      metaDescription
      metaKeywords
      author {
        id
        name
        avatar
        bio
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
  }
`;

const GET_RELATED_POSTS = gql`
  query GetRelatedPosts($slug: String!, $categoryId: String!, $limit: Int!) {
    relatedBlogPosts(slug: $slug, categoryId: $categoryId, limit: $limit) {
      id
      title
      slug
      excerpt
      featuredImage
      publishedAt
      readTime
      category {
        id
        name
        color
      }
    }
  }
`;

const LIKE_BLOG_POST = gql`
  mutation LikeBlogPost($id: String!) {
    likeBlogPost(id: $id) {
      id
      likeCount
      isLiked
    }
  }
`;

const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($id: String!) {
    incrementBlogPostViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [isLiking, setIsLiking] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { data, loading, error } = useQuery(GET_BLOG_POST, {
    variables: { slug },
    onCompleted: (data) => {
      if (data?.blogPost?.id) {
        incrementViewCount({ variables: { id: data.blogPost.id } });
      }
    },
  });

  const { data: relatedData } = useQuery(GET_RELATED_POSTS, {
    variables: {
      slug,
      categoryId: data?.blogPost?.category?.id,
      limit: 3,
    },
    skip: !data?.blogPost?.category?.id,
  });

  const [likeBlogPost] = useMutation(LIKE_BLOG_POST);
  const [incrementViewCount] = useMutation(INCREMENT_VIEW_COUNT);

  const handleLike = async () => {
    if (isLiking || !data?.blogPost?.id) return;
    
    setIsLiking(true);
    try {
      await likeBlogPost({
        variables: { id: data.blogPost.id },
        optimisticResponse: {
          likeBlogPost: {
            __typename: 'BlogPost',
            id: data.blogPost.id,
            likeCount: data.blogPost.isLiked 
              ? data.blogPost.likeCount - 1 
              : data.blogPost.likeCount + 1,
            isLiked: !data.blogPost.isLiked,
          },
        },
        update: (cache, { data: responseData }) => {
          if (responseData?.likeBlogPost) {
            cache.modify({
              id: cache.identify(data.blogPost),
              fields: {
                likeCount: () => responseData.likeBlogPost.likeCount,
                isLiked: () => responseData.likeBlogPost.isLiked,
              },
            });
          }
        },
      });
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = data?.blogPost?.title || '';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-6 mb-3">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">')
      .replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Không tìm thấy bài viết
          </p>
          <Button onClick={() => router.push('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Blog
          </Button>
        </div>
      </div>
    );
  }

  const post = data.blogPost;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Blog
          </Button>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                style={{ backgroundColor: post.category.color }}
                className="text-white"
              >
                {post.category.name}
              </Badge>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(post.publishedAt), 'dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
                
                {post.readTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} phút đọc</span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Author & Stats */}
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {post.author?.name || 'Tác giả'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.publishedAt), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{post.viewCount || 0}</span>
                </div>
                
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center space-x-1 transition-colors ${
                    post.isLiked 
                      ? 'text-red-500' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likeCount || 0}</span>
                </button>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.commentCount || 0}</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Chia sẻ</span>
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        <span className="text-sm">LinkedIn</span>
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="flex items-center space-x-2 w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {copySuccess ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          {copySuccess ? 'Đã sao chép!' : 'Sao chép link'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12">
            <Image
              src={post.featuredImage}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: `<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">${renderContent(post.content)}</p>`,
            }}
          />
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">Thẻ:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: any) => (
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
          </div>
        )}

        {/* Author Bio */}
        {post.author?.bio && (
          <Card className="mt-12">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Về {post.author.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Posts */}
        {relatedData?.relatedBlogPosts?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedData.relatedBlogPosts.map((relatedPost: any) => (
                <Card key={relatedPost.id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {relatedPost.featuredImage ? (
                      <Image
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {relatedPost.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge
                        style={{ backgroundColor: relatedPost.category.color }}
                        className="text-white"
                      >
                        {relatedPost.category.name}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDistanceToNow(new Date(relatedPost.publishedAt), { 
                          addSuffix: true, 
                          locale: vi 
                        })}
                      </span>
                      {relatedPost.readTime && (
                        <>
                          <span>•</span>
                          <span>{relatedPost.readTime} phút đọc</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      <Link 
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                      {relatedPost.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
