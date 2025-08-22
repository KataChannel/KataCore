import { NextRequest, NextResponse } from 'next/server'

interface PerformanceMetric {
  metric: string
  value: number
  url: string
  userAgent: string
  timestamp: number
}

// In-memory storage for development (use Redis/database in production)
const performanceData: PerformanceMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceMetric = await request.json()
    
    // Validate the data
    if (!data.metric || typeof data.value !== 'number' || !data.url) {
      return NextResponse.json(
        { error: 'Invalid performance data' },
        { status: 400 }
      )
    }

    // Store the metric (in production, save to database)
    performanceData.push({
      ...data,
      timestamp: Date.now()
    })

    // Keep only last 1000 metrics in memory
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000)
    }

    // Log significant performance issues
    if (shouldLogMetric(data.metric, data.value)) {
      console.warn(`Performance warning: ${data.metric}=${data.value}ms on ${data.url}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track performance' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || '1h'
    const metric = url.searchParams.get('metric')
    
    const cutoffTime = getTimeframeCutoff(timeframe)
    
    let filteredData = performanceData.filter(d => d.timestamp >= cutoffTime)
    
    if (metric) {
      filteredData = filteredData.filter(d => d.metric === metric)
    }

    // Calculate statistics
    const stats = calculateStats(filteredData)
    
    return NextResponse.json({
      data: filteredData,
      stats,
      count: filteredData.length,
      timeframe
    })
  } catch (error) {
    console.error('Performance data retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    )
  }
}

function shouldLogMetric(metric: string, value: number): boolean {
  const thresholds = {
    'LCP': 2500,  // Largest Contentful Paint
    'FCP': 1800,  // First Contentful Paint
    'FID': 100,   // First Input Delay
    'CLS': 0.1    // Cumulative Layout Shift
  }

  const threshold = thresholds[metric as keyof typeof thresholds]
  if (!threshold) return false

  return value > threshold
}

function getTimeframeCutoff(timeframe: string): number {
  const now = Date.now()
  
  switch (timeframe) {
    case '1h':
      return now - (60 * 60 * 1000)
    case '24h':
      return now - (24 * 60 * 60 * 1000)
    case '7d':
      return now - (7 * 24 * 60 * 60 * 1000)
    case '30d':
      return now - (30 * 24 * 60 * 60 * 1000)
    default:
      return now - (60 * 60 * 1000)
  }
}

function calculateStats(data: PerformanceMetric[]) {
  if (data.length === 0) {
    return { average: 0, median: 0, p95: 0, min: 0, max: 0 }
  }

  const values = data.map(d => d.value).sort((a, b) => a - b)
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length
  const median = values[Math.floor(values.length / 2)]
  const p95Index = Math.floor(values.length * 0.95)
  const p95 = values[p95Index] || values[values.length - 1]
  const min = values[0]
  const max = values[values.length - 1]

  return {
    average: Math.round(average * 100) / 100,
    median,
    p95,
    min,
    max,
    count: values.length
  }
}
