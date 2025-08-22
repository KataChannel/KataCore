'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  
  // Navigation timing
  domContentLoaded?: number
  loadComplete?: number
  
  // Memory usage (if available)
  usedJSHeapSize?: number
  totalJSHeapSize?: number
  
  // Custom metrics
  timeToInteractive?: number
  timeToFirstByte?: number
}

interface PerformanceEntry extends globalThis.PerformanceEntry {
  value?: number
  delta?: number
  id?: string
  rating?: 'good' | 'needs-improvement' | 'poor'
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('performance-monitor') === 'enabled'
    setIsVisible(shouldShow)

    if (!shouldShow) return

    const measurePerformance = () => {
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const navMetrics: PerformanceMetrics = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          timeToFirstByte: navigation.responseStart - navigation.requestStart,
        }
        
        setMetrics(prev => ({ ...prev, ...navMetrics }))
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
        }))
      }
    }

    // Web Vitals using PerformanceObserver
    const observeWebVitals = () => {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
            sendMetricToAnalytics('FCP', entry.startTime)
          }
        }
      }).observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
        sendMetricToAnalytics('LCP', lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any
          setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }))
          sendMetricToAnalytics('FID', fidEntry.processingStart - fidEntry.startTime)
        }
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          }
        }
      }).observe({ entryTypes: ['layout-shift'] })
    }

    // Initial measurement
    measurePerformance()
    
    // Observe Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      observeWebVitals()
    }

    // Re-measure on load
    window.addEventListener('load', measurePerformance)

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [])

  const sendMetricToAnalytics = (name: string, value: number) => {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(value),
        custom_parameter_1: navigator.userAgent,
      })
    }

    // Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(console.error)
    }
  }

  const getMetricRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  const formatValue = (metric: string, value: number): string => {
    if (metric === 'cls') {
      return value.toFixed(3)
    }
    if (metric.includes('HeapSize')) {
      return `${(value / 1024 / 1024).toFixed(1)} MB`
    }
    return `${Math.round(value)} ms`
  }

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1 text-xs">
        {/* Core Web Vitals */}
        {metrics.fcp && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getRatingColor(getMetricRating('fcp', metrics.fcp))}>
              {formatValue('fcp', metrics.fcp)}
            </span>
          </div>
        )}
        
        {metrics.lcp && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getRatingColor(getMetricRating('lcp', metrics.lcp))}>
              {formatValue('lcp', metrics.lcp)}
            </span>
          </div>
        )}
        
        {metrics.fid && (
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getRatingColor(getMetricRating('fid', metrics.fid))}>
              {formatValue('fid', metrics.fid)}
            </span>
          </div>
        )}
        
        {metrics.cls !== undefined && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getRatingColor(getMetricRating('cls', metrics.cls))}>
              {formatValue('cls', metrics.cls)}
            </span>
          </div>
        )}

        <hr className="border-gray-200 dark:border-gray-600 my-2" />

        {/* Navigation timing */}
        {metrics.domContentLoaded && (
          <div className="flex justify-between">
            <span>DOM:</span>
            <span>{formatValue('dom', metrics.domContentLoaded)}</span>
          </div>
        )}
        
        {metrics.loadComplete && (
          <div className="flex justify-between">
            <span>Load:</span>
            <span>{formatValue('load', metrics.loadComplete)}</span>
          </div>
        )}
        
        {metrics.timeToFirstByte && (
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span>{formatValue('ttfb', metrics.timeToFirstByte)}</span>
          </div>
        )}

        {/* Memory usage */}
        {metrics.usedJSHeapSize && (
          <div className="flex justify-between">
            <span>Memory:</span>
            <span>{formatValue('usedJSHeapSize', metrics.usedJSHeapSize)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          Refresh Metrics
        </button>
      </div>
    </div>
  )
}

// Hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const newMetrics: PerformanceMetrics = {}

      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              newMetrics.fcp = entry.startTime
            }
            break
          case 'largest-contentful-paint':
            newMetrics.lcp = entry.startTime
            break
          case 'first-input':
            const fidEntry = entry as any
            newMetrics.fid = fidEntry.processingStart - fidEntry.startTime
            break
        }
      })

      setMetrics(prev => ({ ...prev, ...newMetrics }))
    })

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] })

    return () => observer.disconnect()
  }, [])

  return metrics
}

// Enable performance monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  localStorage.setItem('performance-monitor', 'enabled')
}
