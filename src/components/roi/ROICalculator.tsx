import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/layout/LoadingSpinner'
import { MetricCard } from '@/components/charts/MetricCard'
import { ROIChart } from '@/components/charts/ROIChart'
import { useROICalculation, ROIInputs } from '@/hooks/useROICalculation'
import { useExport } from '@/hooks/useExport'
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils'
import { Calculator, DollarSign, Users, TrendingUp, Download, FileSpreadsheet } from 'lucide-react'
import { toast } from '@/components/ui/toast'

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Professional Services'
]

export function ROICalculator() {
  const [inputs, setInputs] = useState<ROIInputs>({
    companySize: 500,
    industry: 'Technology',
    currentBenefits: {},
    location: '',
    annualRevenue: 0,
    calculationType: 'comprehensive'
  })

  const { calculateROI, saveCalculation, results, isLoading, error } = useROICalculation()
  const { exportToPDF, exportROIToExcel, isExporting } = useExport()

  const handleCalculate = async () => {
    try {
      await calculateROI(inputs)
      toast.success('ROI calculation completed successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to calculate ROI')
    }
  }

  const handleSave = async () => {
    if (!results) return
    
    try {
      await saveCalculation(results)
      toast.success('Calculation saved successfully!')
    } catch (err: any) {
      toast.error('Failed to save calculation')
    }
  }

  const handleExportPDF = async () => {
    try {
      await exportToPDF('roi-results', 'fertility-benefits-roi-analysis')
      toast.success('PDF exported successfully!')
    } catch (err: any) {
      toast.error('Failed to export PDF')
    }
  }

  const handleExportExcel = () => {
    if (!results) return
    
    try {
      exportROIToExcel(results, 'fertility-benefits-roi-calculation')
      toast.success('Excel file downloaded successfully!')
    } catch (err: any) {
      toast.error('Failed to export to Excel')
    }
  }

  const actions = (
    <div className="flex space-x-2">
      {results && (
        <>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            className="flex items-center space-x-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <span>Save Calculation</span>
          </Button>
        </>
      )}
    </div>
  )

  return (
    <PageLayout
      title="Corporate Fertility Benefits ROI Calculator"
      description="Calculate the return on investment for implementing fertility benefits in your organization"
      actions={actions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select
                  id="industry"
                  value={inputs.industry}
                  onChange={(e) => setInputs(prev => ({ ...prev, industry: e.target.value }))}
                >
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="companySize">Number of Employees</Label>
                <Input
                  id="companySize"
                  type="number"
                  value={inputs.companySize}
                  onChange={(e) => setInputs(prev => ({ ...prev, companySize: Number(e.target.value) }))}
                  placeholder="500"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={inputs.location}
                  onChange={(e) => setInputs(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., California, USA"
                />
              </div>
              
              <div>
                <Label htmlFor="annualRevenue">Annual Revenue (Optional)</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  value={inputs.annualRevenue || ''}
                  onChange={(e) => setInputs(prev => ({ ...prev, annualRevenue: Number(e.target.value) || 0 }))}
                  placeholder="50000000"
                />
              </div>
              
              <Button 
                onClick={handleCalculate} 
                disabled={isLoading || !inputs.companySize || !inputs.industry}
                className="w-full"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Calculator className="w-4 h-4 mr-2" />
                )}
                Calculate ROI
              </Button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" text="Calculating ROI..." />
              </CardContent>
            </Card>
          ) : results ? (
            <div id="roi-results" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Annual ROI"
                  value={formatPercentage(results.roi.annualROI)}
                  change={`${results.roi.roiMultiplier.toFixed(1)}x return`}
                  changeType="positive"
                  icon={TrendingUp}
                />
                <MetricCard
                  title="Annual Net Benefit"
                  value={formatCurrency(results.roi.annualNetBenefit)}
                  description="After program costs"
                  icon={DollarSign}
                />
                <MetricCard
                  title="Employees Helped"
                  value={formatNumber(results.employeeImpact.estimatedEmployeesHelped)}
                  description="Estimated annually"
                  icon={Users}
                />
                <MetricCard
                  title="Payback Period"
                  value={`${results.roi.paybackPeriod.toFixed(1)} months`}
                  description="Time to break even"
                  icon={Calculator}
                />
              </div>

              {/* ROI Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ROIChart data={results} />
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Annual Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Program Cost</span>
                      <span className="font-medium">{formatCurrency(results.costs.annualProgramCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Per Employee</span>
                      <span className="font-medium">{formatCurrency(results.costs.costPerEmployee)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Annual Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Recruitment Savings</span>
                      <span className="font-medium">{formatCurrency(results.benefits.recruitmentSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Healthcare Savings</span>
                      <span className="font-medium">{formatCurrency(results.benefits.healthcareSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Productivity Savings</span>
                      <span className="font-medium">{formatCurrency(results.benefits.productivitySavings)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Benefits</span>
                      <span className="font-bold">{formatCurrency(results.benefits.totalAnnualBenefits)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 5-Year Projection */}
              <Card>
                <CardHeader>
                  <CardTitle>5-Year Financial Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(results.costs.fiveYearProgramCost)}</p>
                      <p className="text-sm text-gray-600">Total Investment</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(results.benefits.fiveYearBenefits)}</p>
                      <p className="text-sm text-gray-600">Total Returns</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{formatPercentage(results.roi.fiveYearROI)}</p>
                      <p className="text-sm text-gray-600">5-Year ROI</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Industry Benchmark */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{results.benchmark.industryAverage.toFixed(1)}x</p>
                      <p className="text-sm text-gray-600">Industry Average ROI</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatPercentage(results.benchmark.industryAdoptionRate)}</p>
                      <p className="text-sm text-gray-600">Industry Adoption Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{results.benchmark.industrySatisfactionScore.toFixed(1)}/5</p>
                      <p className="text-sm text-gray-600">Employee Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate ROI</h3>
                  <p className="text-gray-600">Enter your company information to see personalized ROI projections for fertility benefits.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  )
}