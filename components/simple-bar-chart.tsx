// 📄 components/simple-bar-chart.tsx - COLE ISSO NUM ARQUIVO NOVO
"use client"
interface BarChartProps {
  data: { label: string; value: number; color: string }[]
  title: string
}

export function SimpleBarChart({ data, title }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))

  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-500">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                style={{ 
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}