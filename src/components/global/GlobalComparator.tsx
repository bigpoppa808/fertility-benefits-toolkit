import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/layout/LoadingSpinner'
import { MetricCard } from '@/components/charts/MetricCard'
import { useGlobalBenchmarks } from '@/hooks/useDataFetching'
import { GlobalBenchmark } from '@/types'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Globe, MapPin, DollarSign, TrendingUp, Users, Star, Search, Filter, ArrowUpDown } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts'

const REGIONS = ['North America', 'Europe', 'Asia', 'Oceania', 'Middle East']
const MATURITY_LEVELS = ['Very Mature', 'Mature', 'Developing', 'Emerging']
const GOVERNMENT_SUPPORT = ['Very High', 'High', 'Medium', 'Low']

type SortField = 'country' | 'coverage' | 'cost' | 'support'
type SortOrder = 'asc' | 'desc'

export function GlobalComparator() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedMaturity, setSelectedMaturity] = useState('')
  const [selectedSupport, setSelectedSupport] = useState('')
  const [compareCountries, setCompareCountries] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('coverage')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  
  const { data: globalBenchmarks, isLoading, error } = useGlobalBenchmarks()

  // Filter benchmarks based on search and filters
  const filteredBenchmarks = globalBenchmarks.filter(benchmark => {
    const matchesSearch = !searchTerm || 
      benchmark.country.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRegion = !selectedRegion || benchmark.region === selectedRegion
    const matchesMaturity = !selectedMaturity || benchmark.market_maturity === selectedMaturity
    const matchesSupport = !selectedSupport || benchmark.government_support_level === selectedSupport
    
    return matchesSearch && matchesRegion && matchesMaturity && matchesSupport
  })

  // Sort benchmarks
  const sortedBenchmarks = [...filteredBenchmarks].sort((a, b) => {
    let aValue: number | string = 0
    let bValue: number | string = 0
    
    switch (sortField) {
      case 'country':
        aValue = a.country
        bValue = b.country
        break
      case 'coverage':
        aValue = a.fertility_benefit_coverage || 0
        bValue = b.fertility_benefit_coverage || 0
        break
      case 'cost':
        aValue = a.average_treatment_cost || 0
        bValue = b.average_treatment_cost || 0
        break
      case 'support':
        aValue = a.government_support_level || ''
        bValue = b.government_support_level || ''
        break
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }
    
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
  })

  // Get top performers
  const topCoverage = [...globalBenchmarks]
    .sort((a, b) => (b.fertility_benefit_coverage || 0) - (a.fertility_benefit_coverage || 0))
    .slice(0, 3)
  
  const mostAffordable = [...globalBenchmarks]
    .filter(b => b.average_treatment_cost && b.average_treatment_cost > 0)
    .sort((a, b) => (a.average_treatment_cost || 0) - (b.average_treatment_cost || 0))
    .slice(0, 3)

  // Chart data for cost vs coverage analysis
  const costCoverageData = globalBenchmarks
    .filter(b => b.fertility_benefit_coverage && b.average_treatment_cost)
    .map(b => ({
      country: b.country,
      coverage: (b.fertility_benefit_coverage || 0) * 100,
      cost: b.average_treatment_cost || 0,
      region: b.region
    }))

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const toggleCompareCountry = (country: string) => {
    setCompareCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : prev.length < 4 ? [...prev, country] : prev
    )
  }

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'Very Mature': return 'bg-green-100 text-green-800'
      case 'Mature': return 'bg-blue-100 text-blue-800'
      case 'Developing': return 'bg-yellow-100 text-yellow-800'
      case 'Emerging': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSupportColor = (support: string) => {
    switch (support) {
      case 'Very High': return 'bg-green-500'
      case 'High': return 'bg-blue-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const renderComparisonTable = (countries: GlobalBenchmark[]) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2 text-left">Country</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Coverage Rate</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Avg. Treatment Cost</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Government Support</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Market Maturity</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Popular Treatments</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => (
            <tr key={country.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 font-medium">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{country.country}</span>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {country.fertility_benefit_coverage ? 
                  formatPercentage(country.fertility_benefit_coverage * 100) : 'N/A'
                }
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {country.average_treatment_cost ? 
                  formatCurrency(country.average_treatment_cost) : 'N/A'
                }
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getSupportColor(country.government_support_level || '')}`}></div>
                  <span className="text-sm">{country.government_support_level}</span>
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getMaturityColor(country.market_maturity || '')
                }`}>
                  {country.market_maturity}
                </span>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {(country.popular_treatments as string[] || []).slice(0, 3).map((treatment, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {treatment}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" className="flex items-center space-x-2">
        <Globe className="w-4 h-4" />
        <span>Export Comparison</span>
      </Button>
    </div>
  )

  if (error) {
    return (
      <PageLayout
        title="Global Comparator"
        description="Compare international fertility benefits across countries"
      >
        <Card>
          <CardContent className="text-center py-8">
            <Globe className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Global Benchmark Comparator Tool"
      description="Interactive comparison of international fertility benefits policies and markets"
      actions={actions}
    >
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading global benchmark data..." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Countries Tracked"
              value={globalBenchmarks.length}
              icon={Globe}
            />
            <MetricCard
              title="Highest Coverage"
              value={topCoverage[0] ? formatPercentage((topCoverage[0].fertility_benefit_coverage || 0) * 100) : 'N/A'}
              description={topCoverage[0]?.country}
              icon={Star}
            />
            <MetricCard
              title="Most Affordable"
              value={mostAffordable[0] ? formatCurrency(mostAffordable[0].average_treatment_cost || 0) : 'N/A'}
              description={mostAffordable[0]?.country}
              icon={DollarSign}
            />
            <MetricCard
              title="Regions Covered"
              value={new Set(globalBenchmarks.map(b => b.region).filter(Boolean)).size}
              icon={MapPin}
            />
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search Countries</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search countries"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    id="region"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    {REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="maturity">Market Maturity</Label>
                  <Select
                    id="maturity"
                    value={selectedMaturity}
                    onChange={(e) => setSelectedMaturity(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {MATURITY_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="support">Government Support</Label>
                  <Select
                    id="support"
                    value={selectedSupport}
                    onChange={(e) => setSelectedSupport(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {GOVERNMENT_SUPPORT.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedRegion('')
                      setSelectedMaturity('')
                      setSelectedSupport('')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Highest Coverage Countries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topCoverage.map((country, index) => (
                        <div key={country.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-orange-300 text-orange-900'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{country.country}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {formatPercentage((country.fertility_benefit_coverage || 0) * 100)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Affordable Treatment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mostAffordable.map((country, index) => (
                        <div key={country.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-green-400 text-green-900' :
                              index === 1 ? 'bg-blue-300 text-blue-900' :
                              'bg-purple-300 text-purple-900'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{country.country}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {formatCurrency(country.average_treatment_cost || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderComparisonTable(sortedBenchmarks.slice(0, 10))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              {/* Country Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Countries to Compare (up to 4)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sortedBenchmarks.map((country) => (
                      <Button
                        key={country.id}
                        variant={compareCountries.includes(country.country) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCompareCountry(country.country)}
                        disabled={!compareCountries.includes(country.country) && compareCountries.length >= 4}
                        className="justify-start"
                      >
                        {country.country}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Side-by-Side Comparison */}
              {compareCountries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Side-by-Side Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderComparisonTable(
                      globalBenchmarks.filter(b => compareCountries.includes(b.country))
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="rankings" className="space-y-6">
              {/* Sortable Rankings Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Global Rankings</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Click headers to sort</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th 
                            className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('country')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Country</span>
                              {sortField === 'country' && (
                                <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('coverage')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Coverage Rate</span>
                              {sortField === 'coverage' && (
                                <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('cost')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Treatment Cost</span>
                              {sortField === 'cost' && (
                                <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th 
                            className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('support')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Gov Support</span>
                              {sortField === 'support' && (
                                <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Region</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Maturity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedBenchmarks.map((country, index) => (
                          <tr key={country.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-500 w-6">#{index + 1}</span>
                                <span className="font-medium">{country.country}</span>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {country.fertility_benefit_coverage ? 
                                formatPercentage(country.fertility_benefit_coverage * 100) : 'N/A'
                              }
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              {country.average_treatment_cost ? 
                                formatCurrency(country.average_treatment_cost) : 'N/A'
                              }
                            </td>
                            <td className="border border-gray-200 px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getSupportColor(country.government_support_level || '')}`}></div>
                                <span className="text-sm">{country.government_support_level}</span>
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm">{country.region}</td>
                            <td className="border border-gray-200 px-4 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getMaturityColor(country.market_maturity || '')
                              }`}>
                                {country.market_maturity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {/* Cost vs Coverage Scatter Plot */}
              {costCoverageData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cost vs Coverage Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="coverage" 
                            name="Coverage Rate"
                            tickFormatter={(value) => `${value}%`}
                            className="text-sm"
                          />
                          <YAxis 
                            dataKey="cost" 
                            name="Treatment Cost"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                            className="text-sm"
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'Coverage Rate' ? `${value}%` : formatCurrency(value as number),
                              name
                            ]}
                            labelFormatter={(label, payload) => {
                              if (payload && payload[0]) {
                                return payload[0].payload.country
                              }
                              return ''
                            }}
                            contentStyle={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
                          />
                          <Scatter data={costCoverageData} fill="#3b82f6" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      This chart shows the relationship between fertility benefit coverage rates and average treatment costs across countries.
                      Countries in the upper left quadrant offer high coverage at lower costs.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Global Market Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Coverage Leaders</h4>
                        <p className="text-sm text-gray-600">Israel, Denmark, and the UK lead in fertility benefit coverage rates, with government support playing a key role.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Cost Efficiency</h4>
                        <p className="text-sm text-gray-600">European countries generally offer lower treatment costs due to government subsidies and regulated healthcare systems.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Market Maturity</h4>
                        <p className="text-sm text-gray-600">Mature markets show higher adoption rates and more comprehensive treatment options.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Opportunity Markets</h4>
                        <p className="text-sm text-gray-600">Asian markets like Japan and Singapore show growing potential with increasing government support.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </PageLayout>
  )
}