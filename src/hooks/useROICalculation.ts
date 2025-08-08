import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ROIResults } from '@/types'

export interface ROIInputs {
  companySize: number
  industry: string
  currentBenefits: Record<string, any>
  location?: string
  annualRevenue?: number
  calculationType?: string
}

export function useROICalculation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ROIResults | null>(null)

  const calculateROI = async (inputs: ROIInputs) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-roi', {
        body: inputs
      })
      
      if (error) {
        throw new Error(error.message || 'Failed to calculate ROI')
      }
      
      if (data?.error) {
        throw new Error(data.error.message || 'Calculation failed')
      }
      
      setResults(data.data)
      return data.data as ROIResults
      
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCalculation = async (calculationData: ROIResults) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('roi_calculations')
        .insert({
          user_id: user?.id,
          company_name: calculationData.calculationParameters.companySize ? `${calculationData.calculationParameters.industry} Company` : null,
          company_size: calculationData.calculationParameters.companySize,
          industry: calculationData.calculationParameters.industry,
          calculation_parameters: calculationData.calculationParameters,
          results: calculationData,
          roi_percentage: calculationData.roi.annualROI,
          annual_savings: calculationData.roi.annualNetBenefit
        })
      
      if (error) {
        throw new Error('Failed to save calculation')
      }
    } catch (err: any) {
      console.error('Error saving calculation:', err)
      throw err
    }
  }

  return {
    calculateROI,
    saveCalculation,
    results,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}