// 📄 hooks/use-lazy-load.ts - COLE ISSO NUM ARQUIVO NOVO
"use client"
import { useState, useEffect, useRef } from 'react'

export function useLazyLoad<T>(data: T[], itemsPerPage: number = 10) {
  const [visibleItems, setVisibleItems] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carregar primeira página
    const initialItems = data.slice(0, itemsPerPage)
    setVisibleItems(initialItems)
    setCurrentPage(1)
  }, [data, itemsPerPage])

  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems.length < data.length) {
          // Carregar mais itens quando o usuário chegar no final
          const nextPage = currentPage + 1
          const nextItems = data.slice(0, nextPage * itemsPerPage)
          setVisibleItems(nextItems)
          setCurrentPage(nextPage)
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [currentPage, data, itemsPerPage, visibleItems.length])

  return { visibleItems, loadMoreRef }
}