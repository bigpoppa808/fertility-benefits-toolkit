import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MarketStatistic, IndustryBenchmark, PolicyUpdate, GlobalBenchmark } from '@/types'

export function useMarketStatistics() {
  const [data, setData] = useState<MarketStatistic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: stats, error } = await supabase
          .from('market_statistics')
          .select('*')
          .eq('is_current', true)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setData(stats || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, error }
}

export function useIndustryBenchmarks(industry?: string) {
  const [data, setData] = useState<IndustryBenchmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase
          .from('industry_benchmarks')
          .select('*')
          .order('industry_name')
        
        if (industry) {
          query = query.eq('industry_name', industry)
        }
        
        const { data: benchmarks, error } = await query
        
        if (error) throw error
        setData(benchmarks || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [industry])

  return { data, isLoading, error }
}

export function usePolicyUpdates() {
  const [data, setData] = useState<PolicyUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: policies, error } = await supabase
          .from('policy_updates')
          .select('*')
          .eq('is_active', true)
          .order('effective_date', { ascending: false })
        
        if (error) throw error
        setData(policies || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, error }
}

export function useGlobalBenchmarks() {
  const [data, setData] = useState<GlobalBenchmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: benchmarks, error } = await supabase
          .from('global_benchmarks')
          .select('*')
          .order('fertility_benefit_coverage', { ascending: false })
        
        if (error) throw error
        setData(benchmarks || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, isLoading, error }
}