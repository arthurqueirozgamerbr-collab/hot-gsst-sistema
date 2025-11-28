// 📄 components/metric-card.tsx - SUBSTITUA pelo código corrigido
import { Card } from './ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: string
  description?: string
}

export function MetricCard({ title, value, change, trend = 'neutral', icon, description }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50', 
    neutral: 'text-gray-600 bg-gray-50'
  }

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '➡️'
  }

  return (
    <Card hover className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-green-100 text-green-600`}>
          {icon}
        </div>
        {change && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]} {change}
          </span>
        )}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="font-semibold text-gray-900 mb-1">{title}</div>
      {description && (
        <div className="text-sm text-gray-500">{description}</div>
      )}
    </Card>
  )
}