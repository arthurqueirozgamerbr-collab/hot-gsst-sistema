// 📄 components/session-alert.tsx - ATUALIZE para 4 horas
"use client"
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

export function SessionAlert() {
  const { sessionTimeLeft, signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)

  // Converter para horas, minutos e segundos
  const hoursLeft = Math.floor(sessionTimeLeft / 3600000)
  const minutesLeft = Math.floor((sessionTimeLeft % 3600000) / 60000)
  const secondsLeft = Math.floor((sessionTimeLeft % 60000) / 1000)

  useEffect(() => {
    // Mostrar alerta quando faltar 30 minutos (0.5 horas)
    if (sessionTimeLeft <= 30 * 60 * 1000 && sessionTimeLeft > 0) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [sessionTimeLeft])

  if (!showWarning) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-4">
        <span className="text-lg">⏰</span>
        <div>
          <div className="font-medium">Sessão expirando!</div>
          <div className="text-sm">
            {hoursLeft > 0 ? `${hoursLeft}h ` : ''}
            {minutesLeft}m {secondsLeft}s restantes
          </div>
        </div>
        <button
          onClick={signOut}
          className="px-3 py-1 bg-white text-yellow-600 rounded text-sm font-medium hover:bg-gray-100"
        >
          Sair
        </button>
      </div>
    </div>
  )
}