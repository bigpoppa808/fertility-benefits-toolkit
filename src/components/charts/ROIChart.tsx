import { memo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ROIChartProps {
  data: {
    costs: { annualProgramCost: number }
    benefits: { totalAnnualBenefits: number }
    roi: { annualNetBenefit: number }
  }
}

export const ROIChart = memo(function ROIChart({ data }: ROIChartProps) {
  const chartData = [
    {
      name: 'Annual Analysis',
      'Program Cost': data.costs.annualProgramCost,
      'Total Benefits': data.benefits.totalAnnualBenefits,
      'Net Benefit': data.roi.annualNetBenefit,
    },
  ]

  const formatTooltip = (value: number, name: string) => {
    return [formatCurrency(value), name]
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="ROI Financial Analysis Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          accessibilityLayer
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" className="text-sm" />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} className="text-sm" />
          <Tooltip 
            formatter={formatTooltip} 
            contentStyle={{ 
              backgroundColor: 'white', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px' 
            }} 
          />
          <Legend />
          <Bar dataKey="Program Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Total Benefits" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Net Benefit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})