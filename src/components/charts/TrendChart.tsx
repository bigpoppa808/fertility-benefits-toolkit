import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { MarketStatistic } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface TrendChartProps {
  data: MarketStatistic[]
  dataKey: string
  title: string
}

export function TrendChart({ data, dataKey, title }: TrendChartProps) {
  const chartData = data
    .filter(item => item.year && item.statistic_value)
    .map(item => ({
      year: item.year,
      value: item.statistic_value,
      name: item.statistic_name,
      unit: item.statistic_unit
    }))
    .sort((a, b) => (a.year || 0) - (b.year || 0))

  const formatTooltip = (value: number, name: string, props: any) => {
    const unit = props.payload?.unit
    if (unit === 'billion USD' || unit === 'USD') {
      return [formatCurrency(value * (unit === 'billion USD' ? 1000000000 : 1)), name]
    }
    return [formatNumber(value), name]
  }

  const formatYAxis = (value: number) => {
    const firstItem = chartData[0]
    if (firstItem?.unit === 'billion USD') {
      return `$${value}B`
    }
    if (firstItem?.unit === 'percentage') {
      return `${value}%`
    }
    return formatNumber(value)
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="year" className="text-sm" />
          <YAxis tickFormatter={formatYAxis} className="text-sm" />
          <Tooltip formatter={formatTooltip} contentStyle={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}