import { useState, useEffect } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/layout/LoadingSpinner'
import { MetricCard } from '@/components/charts/MetricCard'
import { IndustryChart } from '@/components/charts/IndustryChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { useMarketStatistics, useIndustryBenchmarks } from '@/hooks/useDataFetching'
import { useAIInsights, InsightRequest } from '@/hooks/useAIInsights'
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils'
import { Brain, BarChart3, TrendingUp, Users, DollarSign, Lightbulb, RefreshCw } from 'lucide-react'
import { toast } from '@/components/ui/toast'

const INDUSTRIES = [
  'Technology',
  'Healthcare', 
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Professional Services'
]

const INSIGHT_TYPES = [
  { value: 'market_positioning', label: 'Market Positioning' },
  { value: 'competitive_analysis', label: 'Competitive Analysis' },
  { value: 'implementation_strategy', label: 'Implementation Strategy' },
  { value: 'roi_analysis', label: 'ROI Analysis' },
  { value: 'general', label: 'General Insights' }
]

export function AIDashboard() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Technology')
  const [activeTab, setActiveTab] = useState('overview')
  const [aiParams, setAiParams] = useState({
    companySize: 500,
    industry: 'Technology',
    location: '',
    insightType: 'market_positioning' as InsightRequest['insightType'],
    specificQuestions: []
  })

  const { data: marketStats, isLoading: marketLoading } = useMarketStatistics()
  const { data: industryBenchmarks, isLoading: benchmarksLoading } = useIndustryBenchmarks()
  const { generateInsights, insights, isLoading: aiLoading, error: aiError } = useAIInsights()

  // Filter market stats for key metrics
  const keyMetrics = [
    marketStats.find(s => s.statistic_name.includes('Fertility Market Size 2025')),
    marketStats.find(s => s.statistic_name.includes('Employer Adoption Rate')),
    marketStats.find(s => s.statistic_name.includes('Would Switch for Benefits')),
    marketStats.find(s => s.statistic_name.includes('ROI Range High'))
  ].filter(Boolean)

  // Filter industry benchmarks for selected industry
  const industryData = industryBenchmarks.filter(b => 
    !selectedIndustry || b.industry_name === selectedIndustry
  )

  // Market growth data for trend chart
  const growthData = marketStats.filter(s => 
    s.statistic_name.includes('Market') && s.year
  )

  const handleGenerateInsights = async () => {
    try {
      const request: InsightRequest = {
        companyData: {
          industry: aiParams.industry,
          companySize: aiParams.companySize,
          location: aiParams.location || undefined
        },
        benchmarkData: industryData,
        insightType: aiParams.insightType,
        specificQuestions: aiParams.specificQuestions
      }
      
      await generateInsights(request)
      toast.success('AI insights generated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate insights')
    }
  }

  const actions = (
    <Button
      onClick={handleGenerateInsights}
      disabled={aiLoading}
      className="flex items-center space-x-2"
    >
      {aiLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Brain className="w-4 h-4" />
      )}
      <span>Generate AI Insights</span>
    </Button>
  )

  return (
    <PageLayout
      title="AI-Powered Fertility Benefits Dashboard"
      description="Market intelligence and strategic insights for fertility benefits implementation"
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="benchmarks">Industry Benchmarks</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => {
              if (!metric) return null
              
              const value = metric.statistic_value || 0
              let formattedValue = formatNumber(value)
              
              if (metric.statistic_unit === 'billion USD') {
                formattedValue = `$${value}B`
              } else if (metric.statistic_unit === 'percentage') {
                formattedValue = `${value}%`
              } else if (metric.statistic_unit === 'multiplier') {
                formattedValue = `${value}x`
              }
              
              const icons = [DollarSign, Users, TrendingUp, BarChart3]
              const Icon = icons[index % icons.length]
              
              return (
                <MetricCard
                  key={metric.id}
                  title={metric.statistic_name.replace(/\d{4}/, '').trim()}
                  value={formattedValue}
                  description={metric.source || ''}
                  icon={Icon}
                />
              )
            })}
          </div>

          {/* Market Overview Chart */}
          {growthData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Market Growth Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart 
                  data={growthData} 
                  dataKey="value" 
                  title="Fertility Market Growth" 
                />
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>2025 Market Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">$9B</p>
                  <p className="text-sm text-gray-600">US Market Size</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">42%</p>
                  <p className="text-sm text-gray-600">Employer Adoption</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">65%</p>
                  <p className="text-sm text-gray-600">Would Switch Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          {/* Industry Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Label htmlFor="industry-filter">Filter by Industry:</Label>
                <Select
                  id="industry-filter"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">All Industries</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </Select>
              </div>
              
              {industryData.length > 0 ? (
                <IndustryChart data={industryData} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No benchmark data available for selected industry</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benchmark Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Industry Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Industry</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Company Size</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Adoption Rate</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Avg Cost/Employee</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Avg ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryData.map((benchmark) => (
                      <tr key={benchmark.id} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2">{benchmark.industry_name}</td>
                        <td className="border border-gray-200 px-4 py-2">{benchmark.company_size_category}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          {benchmark.fertility_benefit_adoption_rate ? 
                            formatPercentage(benchmark.fertility_benefit_adoption_rate * 100) : 'N/A'
                          }
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {benchmark.average_cost_per_employee ? 
                            formatCurrency(benchmark.average_cost_per_employee) : 'N/A'
                          }
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          {benchmark.average_roi ? 
                            `${benchmark.average_roi.toFixed(1)}x` : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {growthData.length > 0 ? (
                  <TrendChart 
                    data={growthData} 
                    dataKey="value" 
                    title="Market Size Growth" 
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Market Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Employee Demand</h4>
                      <p className="text-sm text-gray-600">65% of employees would switch jobs for fertility benefits</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Strong ROI</h4>
                      <p className="text-sm text-gray-600">Companies see 2-4x return through retention and productivity</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Competitive Advantage</h4>
                      <p className="text-sm text-gray-600">Only 42% of employers currently offer fertility benefits</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Market Growth</h4>
                      <p className="text-sm text-gray-600">Market projected to reach $19.7B by 2034</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          {/* AI Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>AI Insight Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="ai-industry">Industry</Label>
                  <Select
                    id="ai-industry"
                    value={aiParams.industry}
                    onChange={(e) => setAiParams(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ai-company-size">Company Size</Label>
                  <Input
                    id="ai-company-size"
                    type="number"
                    value={aiParams.companySize}
                    onChange={(e) => setAiParams(prev => ({ ...prev, companySize: Number(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ai-location">Location</Label>
                  <Input
                    id="ai-location"
                    value={aiParams.location}
                    onChange={(e) => setAiParams(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                
                <div>
                  <Label htmlFor="insight-type">Insight Type</Label>
                  <Select
                    id="insight-type"
                    value={aiParams.insightType}
                    onChange={(e) => setAiParams(prev => ({ ...prev, insightType: e.target.value as InsightRequest['insightType'] }))}
                  >
                    {INSIGHT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Results */}
          {aiLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Generating AI insights..." />
              </CardContent>
            </Card>
          ) : insights ? (
            <div className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="ROI Multiplier"
                  value={insights.summaryMetrics.keyMetrics.roiMultiplier}
                  icon={TrendingUp}
                />
                <MetricCard
                  title="Market Timing"
                  value={insights.summaryMetrics.keyMetrics.marketTiming}
                  icon={BarChart3}
                />
                <MetricCard
                  title="Competitive Edge"
                  value={insights.summaryMetrics.keyMetrics.competitiveAdvantage}
                  icon={Users}
                />
                <MetricCard
                  title="Priority Level"
                  value={insights.summaryMetrics.recommendations.priority}
                  icon={Lightbulb}
                />
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>AI Strategic Insights</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateInsights}
                      disabled={aiLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {insights.insights}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Implementation Timeline</h4>
                      <p className="text-sm text-gray-600">{insights.summaryMetrics.recommendations.timeline}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Expected ROI</h4>
                      <p className="text-sm text-gray-600">{insights.summaryMetrics.recommendations.expectedROI}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Ready</h3>
                  <p className="text-gray-600">Configure your parameters and generate strategic insights for fertility benefits implementation.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {aiError && (
            <Card>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{aiError}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}