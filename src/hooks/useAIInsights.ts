import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ROIResults, AIInsightResult } from '@/types'

export interface InsightRequest {
  companyData?: {
    industry: string
    companySize: number
    location?: string
    annualRevenue?: number
  }
  roiResults?: ROIResults
  benchmarkData?: any
  insightType: 'roi_analysis' | 'market_positioning' | 'implementation_strategy' | 'competitive_analysis' | 'general'
  specificQuestions?: string[]
}

export function useAIInsights() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<AIInsightResult | null>(null)

  const generateInsights = async (request: InsightRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: request
      })
      
      if (error) {
        throw new Error(error.message || 'Failed to generate insights')
      }
      
      if (data?.error) {
        throw new Error(data.error.message || 'AI insight generation failed')
      }
      
      setInsights(data.data)
      return data.data as AIInsightResult
      
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateInsights,
    insights,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}