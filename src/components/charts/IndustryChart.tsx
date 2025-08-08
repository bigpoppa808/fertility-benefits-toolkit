import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { IndustryBenchmark } from '@/types'
import { formatPercentage } from '@/lib/utils'

interface IndustryChartProps {
  data: IndustryBenchmark[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function IndustryChart({ data }: IndustryChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.industry_name,
    value: (item.fertility_benefit_adoption_rate || 0) * 100,
    color: COLORS[index % COLORS.length]
  }))

  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 shadow-lg border rounded">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Adoption Rate: {formatPercentage(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend 
            formatter={(value, entry: any) => `${value}: ${formatPercentage(entry.payload.value)}`}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}