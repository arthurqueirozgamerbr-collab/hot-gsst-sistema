"use client"
import { useEffect, useRef } from 'react'

interface SimpleChartProps {
  data: Array<{ data: string; classificacoes: number; revisoes: number; entradas: number }>
  periodo: string
}

export default function SimpleChart({ data, periodo }: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Encontrar valores máximos para escala
    const maxValue = Math.max(...data.map(d =>
      d.classificacoes + d.revisoes + d.entradas
    ))

    // Desenhar eixos
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
   
    // Eixo Y
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.stroke()

    // Eixo X
    ctx.beginPath()
    ctx.moveTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Desenhar dados
    const barWidth = chartWidth / data.length * 0.6
    const spacing = chartWidth / data.length * 0.4

    data.forEach((item, index) => {
      const x = padding + index * (barWidth + spacing) + spacing / 2
      const total = item.classificacoes + item.revisoes + item.entradas
      const height = (total / maxValue) * chartHeight

      // Barra de classificações (verde)
      if (item.classificacoes > 0) {
        ctx.fillStyle = '#10b981'
        const classHeight = (item.classificacoes / maxValue) * chartHeight
        ctx.fillRect(x, canvas.height - padding - classHeight, barWidth, classHeight)
      }

      // Barra de revisões (amarelo)
      if (item.revisoes > 0) {
        ctx.fillStyle = '#f59e0b'
        const revHeight = (item.revisoes / maxValue) * chartHeight
        const yStart = canvas.height - padding - height
        ctx.fillRect(x, yStart, barWidth, revHeight)
      }

      // Barra de entradas (azul)
      if (item.entradas > 0) {
        ctx.fillStyle = '#3b82f6'
        const entHeight = (item.entradas / maxValue) * chartHeight
        const yStart = canvas.height - padding - height + (item.classificacoes + item.revisoes) / maxValue * chartHeight
        ctx.fillRect(x, yStart, barWidth, entHeight)
      }

      // Rótulos
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(item.data, x + barWidth / 2, canvas.height - padding + 15)
    })

    // Legenda
    const legendData = [
      { color: '#3b82f6', label: 'Entradas' },
      { color: '#f59e0b', label: 'Revisões' },
      { color: '#10b981', label: 'Classificações' }
    ]

    legendData.forEach((item, index) => {
      const x = padding + index * 80
      const y = 20

      ctx.fillStyle = item.color
      ctx.fillRect(x, y, 12, 12)

      ctx.fillStyle = '#374151'
      ctx.font = '12px Inter'
      ctx.textAlign = 'left'
      ctx.fillText(item.label, x + 18, y + 10)
    })

  }, [data, periodo])

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Atividade por Período
      </h4>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="max-w-full"
        />
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Período: {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
      </div>
    </div>
  )
}