// PATH: app/hot/debug/biblioteca/page.tsx
"use client"
import { useEffect, useState } from "react"

export default function DebugBiblioteca() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/hot/biblioteca')
      .then(res => res.json())
      .then(data => setItems(data.items || []))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📚 Debug Biblioteca</h1>
      <p className="mb-4">Total: {items.length} itens</p>
      
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded">
            <div className="font-bold">{item.texto}</div>
            <div className="text-sm text-gray-600">
              Categoria: {item.categoria} • 
              Usos: {item.vezes_utilizada} • 
              Atualizado: {new Date(item.data).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}