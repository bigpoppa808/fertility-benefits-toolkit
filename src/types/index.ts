export interface Company {
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

export interface IndustryBenchmark {
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

export interface MarketStatistic {
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

export interface PolicyUpdate {
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

export interface GlobalBenchmark {
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

export interface ROICalculation {
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

export interface ROIResults {
  costs: {
    annualProgramCost: number
    costPerEmployee: number
    fiveYearProgramCost: number
  }
  benefits: {
    recruitmentSavings: number
    healthcareSavings: number
    productivitySavings: number
    totalAnnualBenefits: number
    fiveYearBenefits: number
  }
  roi: {
    annualROI: number
    roiMultiplier: number
    annualNetBenefit: number
    fiveYearROI: number
    fiveYearNetBenefit: number
    paybackPeriod: number
  }
  employeeImpact: {
    satisfactionIncrease: number
    retentionIncrease: number
    estimatedEmployeesHelped: number
    currentTurnoverRate: number
    newTurnoverRate: number
  }
  benchmark: {
    industryAverage: number
    industryAdoptionRate: number
    industrySatisfactionScore: number
  }
  calculationParameters: {
    companySize: number
    industry: string
    sizeCategory: string
    currentBenefits: any
    location?: string
    annualRevenue?: number
    calculationType: string
  }
}

export interface AIInsightResult {
  insights: string
  summaryMetrics: {
    keyMetrics: {
      roiMultiplier: number | string
      industryRanking: string
      marketTiming: string
      competitiveAdvantage: string
    }
    recommendations: {
      priority: string
      timeline: string
      budget: number
      expectedROI: string
    }
  }
  contextUsed: {
    marketDataPoints: number
    policyUpdatesConsidered: number
    benchmarkData: boolean
    roiData: boolean
  }
  generatedAt: string
  insightType: string
}