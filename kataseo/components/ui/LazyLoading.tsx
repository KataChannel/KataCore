'use client'

import { lazy, Suspense, ComponentType, useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

// Generic lazy loading wrapper
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Default loading skeleton
export function ComponentSkeleton({ 
  className, 
  height = 'h-32',
  width = 'w-full' 
}: { 
  className?: string
  height?: string
  width?: string
}) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', height, width, className)} />
  )
}

// Specific skeletons for different components
export function PostEditorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-64 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}

export function MediaPickerSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  )
}

export function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Intersection Observer based lazy loading
export function InViewLazyComponent({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  className,
}: {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  fallback?: React.ReactNode
  className?: string
}) {
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsInView(true)
          setHasLoaded(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasLoaded])

  return (
    <div ref={ref} className={className}>
      {isInView ? children : (fallback || <ComponentSkeleton />)}
    </div>
  )
}

// Pre-made lazy components for the app
export const LazyPostEditor = createLazyComponent(
  () => import('@/components/admin/posts/PostEditor'),
  <PostEditorSkeleton />
)

export const LazyMediaPicker = createLazyComponent(
  () => import('@/components/editor/MediaPicker'),
  <MediaPickerSkeleton />
)

export const LazyBlockEditor = createLazyComponent(
  () => import('@/components/editor/BlockEditor'),
  <ComponentSkeleton height="h-64" />
)

// Hook for managing lazy loading state
export function useLazyLoading(delay: number = 0) {
  const [shouldLoad, setShouldLoad] = useState(delay === 0)

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldLoad(true), delay)
      return () => clearTimeout(timer)
    }
  }, [delay])

  return shouldLoad
}
