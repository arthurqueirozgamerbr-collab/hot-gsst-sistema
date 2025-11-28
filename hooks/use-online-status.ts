// 📄 hooks/use-online-status.ts - VERIFIQUE SE ESTÁ CORRETO
"use client"
import { useState, useEffect } from 'react'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => {
      console.log('Online')
      setIsOnline(true)
    }
    
    const handleOffline = () => {
      console.log('Offline')
      setIsOnline(false)
    }

    // Configurar listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, []) // Array de dependências vazio - executa apenas uma vez

  return isOnline
}