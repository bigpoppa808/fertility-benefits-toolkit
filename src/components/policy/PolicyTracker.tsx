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
import { usePolicyUpdates } from '@/hooks/useDataFetching'
import { PolicyUpdate } from '@/types'
import { Bell, Calendar, Globe, TrendingUp, AlertCircle, ExternalLink, Filter, Search } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

const POLICY_TYPES = [
  'Government Benefits',
  'State Legislation', 
  'International Legislation',
  'Tax Policy',
  'Policy Analysis'
]

const REGIONS = [
  'United States',
  'California',
  'New York',
  'European Union',
  'Global'
]

export function PolicyTracker() {
  const [activeTab, setActiveTab] = useState('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  
  const { data: policies, isLoading, error } = usePolicyUpdates()

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = !searchTerm || 
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || policy.policy_type === selectedType
    const matchesRegion = !selectedRegion || policy.region === selectedRegion
    
    return matchesSearch && matchesType && matchesRegion
  })

  // Group policies by type for analytics
  const policiesByType = POLICY_TYPES.map(type => ({
    type,
    count: policies.filter(p => p.policy_type === type).length
  }))

  // Recent policies (last 6 months)
  const recentPolicies = filteredPolicies
    .filter(p => p.effective_date && 
      parseISO(p.effective_date) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    )
    .sort((a, b) => 
      new Date(b.effective_date || 0).getTime() - new Date(a.effective_date || 0).getTime()
    )

  // Upcoming policies
  const upcomingPolicies = filteredPolicies
    .filter(p => p.effective_date && parseISO(p.effective_date) > new Date())
    .sort((a, b) => 
      new Date(a.effective_date || 0).getTime() - new Date(b.effective_date || 0).getTime()
    )

  const getImpactColor = (impactLevel: string) => {
    if (impactLevel.toLowerCase().includes('major') || impactLevel.toLowerCase().includes('significant')) {
      return 'bg-red-100 text-red-800'
    }
    if (impactLevel.toLowerCase().includes('moderate')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-green-100 text-green-800'
  }

  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case 'Government Benefits':
        return <Globe className="w-4 h-4" />
      case 'State Legislation':
        return <TrendingUp className="w-4 h-4" />
      case 'International Legislation':
        return <Globe className="w-4 h-4" />
      case 'Tax Policy':
        return <Calendar className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const renderPolicyCard = (policy: PolicyUpdate) => (
    <Card key={policy.id} className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{policy.title}</CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                {getPolicyTypeIcon(policy.policy_type || '')}
                <span>{policy.policy_type}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>{policy.region}</span>
              </div>
              {policy.effective_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(policy.effective_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {policy.source_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(policy.source_url!, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{policy.description}</p>
        {policy.impact_assessment && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Impact Assessment</h4>
            <p className="text-sm text-gray-600">{policy.impact_assessment}</p>
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">
            Updated {formatDistanceToNow(parseISO(policy.updated_at))} ago
          </span>
          {policy.impact_assessment && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              getImpactColor(policy.impact_assessment)
            }`}>
              Impact Assessment Available
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" className="flex items-center space-x-2">
        <Bell className="w-4 h-4" />
        <span>Set Alerts</span>
      </Button>
    </div>
  )

  if (error) {
    return (
      <PageLayout
        title="Policy Tracker"
        description="Monitor fertility-related policy changes and legislation"
      >
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Policies</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Predictive Policy Tracker Dashboard"
      description="Real-time monitoring of fertility-related legislation and policy changes"
      actions={actions}
    >
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading policy data..." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Policies Tracked"
              value={policies.length}
              icon={Globe}
            />
            <MetricCard
              title="Recent Updates"
              value={recentPolicies.length}
              icon={TrendingUp}
              description="Last 6 months"
            />
            <MetricCard
              title="Upcoming Changes"
              value={upcomingPolicies.length}
              icon={Calendar}
              description="Future effective dates"
            />
            <MetricCard
              title="Active Regions"
              value={new Set(policies.map(p => p.region).filter(Boolean)).size}
              icon={Globe}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Policies</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title or description"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="policy-type">Policy Type</Label>
                  <Select
                    id="policy-type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {POLICY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
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
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('')
                      setSelectedRegion('')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recent">Recent Updates</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Changes</TabsTrigger>
              <TabsTrigger value="all">All Policies</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {recentPolicies.length > 0 ? (
                <div className="space-y-4">
                  {recentPolicies.map(renderPolicyCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Updates</h3>
                    <p className="text-gray-600">No policy updates found in the last 6 months matching your filters.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingPolicies.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPolicies.map(renderPolicyCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Changes</h3>
                    <p className="text-gray-600">No upcoming policy changes found matching your filters.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {filteredPolicies.length > 0 ? (
                <div className="space-y-4">
                  {filteredPolicies.map(renderPolicyCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Found</h3>
                    <p className="text-gray-600">No policies found matching your current filters.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Policy Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Distribution by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policiesByType.map(({ type, count }) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPolicyTypeIcon(type)}
                          <span className="text-sm">{type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${(count / Math.max(...policiesByType.map(p => p.count), 1)) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Policy Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">FEHB Expansion Impact</h4>
                        <p className="text-sm text-gray-600">Federal employees now have comprehensive fertility coverage, creating competitive pressure on private employers.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">State-Level Progress</h4>
                        <p className="text-sm text-gray-600">California and New York leading with comprehensive fertility insurance mandates.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">International Standards</h4>
                        <p className="text-sm text-gray-600">EU directive establishing minimum fertility care standards across member states.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Tax Incentives</h4>
                        <p className="text-sm text-gray-600">New York introducing tax credits for employers providing fertility benefits.</p>
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