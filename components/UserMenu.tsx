"use client"
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Link from 'next/link'

export default function UserMenu() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
        <span>Carregando...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-gray-700 hover:text-green-700 font-medium transition-colors flex items-center gap-2"
        >
          <span>🔐</span>
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user.nome.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-900">{user.nome}</div>
          <div className="text-xs text-gray-500 capitalize">{user.nivel}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* Header do Menu */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{user.nome}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.nivel === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.nivel === 'admin' ? '👑 Administrador' : '👤 Usuário'}
              </span>
            </div>
          </div>

          {/* Links do Menu */}
          <div className="py-2">
            <Link
              href="/perfil"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>👤</span>
              Meu Perfil
            </Link>

            {isAdmin && (
              <Link
                href="/gestao"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>🛠️</span>
                Gestão do Sistema
              </Link>
            )}

            <Link
              href="/hot/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>📊</span>
              Dashboard
            </Link>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            Sair do Sistema
          </button>
        </div>
      )}
    </div>
  )
}