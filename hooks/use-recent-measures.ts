// 📄 hooks/use-recent-measures.ts - COLE ISSO NUM ARQUIVO NOVO
"use client"
import { useState, useEffect } from 'react'

export function useRecentMeasures() {
  const [recentMeasures, setRecentMeasures] = useState<string[]>([])

  useEffect(() => {
    // Carregar do localStorage
    const saved = localStorage.getItem('hot-recent-measures')
    if (saved) {
      setRecentMeasures(JSON.parse(saved))
    }
  }, [])

  const addRecentMeasure = (texto: string) => {
    setRecentMeasures(prev => {
      const newRecent = [texto, ...prev.filter(t => t !== texto)].slice(0, 10) // Máximo 10
      localStorage.setItem('hot-recent-measures', JSON.stringify(newRecent))
      return newRecent
    })
  }

  const clearRecentMeasures = () => {
    setRecentMeasures([])
    localStorage.removeItem('hot-recent-measures')
  }

  return {
    recentMeasures,
    addRecentMeasure,
    clearRecentMeasures
  }
}