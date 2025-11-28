// 📄 components/online-status.tsx - VERSÃO CORRIGIDA
"use client"
import { useOnlineStatus } from '../hooks/use-online-status'
import { useToast } from '../hooks/use-toast'
import { useEffect, useRef } from 'react'

export default function OnlineStatus() {
  const isOnline = useOnlineStatus()
  const { toast } = useToast()
  const prevOnlineStatus = useRef<boolean | null>(null)

  useEffect(() => {
    // Só mostrar toast quando o status mudar
    if (prevOnlineStatus.current === null) {
      // Primeira renderização, apenas armazenar o status atual
      prevOnlineStatus.current = isOnline
      return
    }

    if (prevOnlineStatus.current !== isOnline) {
      // Status mudou, mostrar toast
      if (!isOnline) {
        toast({
          type: 'warning',
          title: 'Você está offline',
          description: 'Algumas funcionalidades podem não estar disponíveis'
        })
      } else {
        toast({
          type: 'success', 
          title: 'Conexão restaurada',
          description: 'Você está online novamente'
        })
      }
      
      // Atualizar o status anterior
      prevOnlineStatus.current = isOnline
    }
  }, [isOnline, toast])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <span>⚠️</span>
        <span>Você está offline</span>
      </div>
    </div>
  )
}