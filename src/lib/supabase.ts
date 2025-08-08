import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xavvknokoxcszwxilhlu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhdnZrbm9rb3hjc3p3eGlsaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODY2NzEsImV4cCI6MjA2Nzc2MjY3MX0.kACTAW0u1CfgZBeU8mZtw5uR8pBSYVs8sLNh7YEhB40'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          employee_count: number | null
          current_benefits: any | null
          location: string | null
          annual_revenue: number | null
          created_at: string
          updated_at: string
        }
      }
      industry_benchmarks: {
        Row: {
          id: string
          industry_name: string
          company_size_category: string | null
          fertility_benefit_adoption_rate: number | null
          average_cost_per_employee: number | null
          average_roi: number | null
          employee_satisfaction_score: number | null
          retention_improvement: number | null
          year: number | null
          created_at: string
        }
      }
      market_statistics: {
        Row: {
          id: string
          statistic_name: string
          statistic_value: number | null
          statistic_unit: string | null
          category: string | null
          source: string | null
          year: number | null
          is_current: boolean | null
          created_at: string
        }
      }
      policy_updates: {
        Row: {
          id: string
          title: string
          description: string | null
          policy_type: string | null
          region: string | null
          effective_date: string | null
          impact_assessment: string | null
          source_url: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
      }
      global_benchmarks: {
        Row: {
          id: string
          country: string
          region: string | null
          fertility_benefit_coverage: number | null
          government_support_level: string | null
          average_treatment_cost: number | null
          popular_treatments: any | null
          market_maturity: string | null
          year: number | null
          created_at: string
        }
      }
      roi_calculations: {
        Row: {
          id: string
          user_id: string | null
          company_name: string | null
          company_size: number | null
          industry: string | null
          calculation_parameters: any | null
          results: any | null
          roi_percentage: number | null
          annual_savings: number | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}