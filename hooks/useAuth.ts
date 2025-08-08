'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur vient d'être déconnecté
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('logged_out') === 'true') {
      localStorage.setItem('force_login', 'true')
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    const forceLogin = localStorage.getItem('force_login') === 'true'
    if (forceLogin) {
      localStorage.removeItem('force_login')
      window.location.href = '/api/auth/login?force_login=true'
    } else {
      window.location.href = '/api/auth/login'
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        setUser(null)
        // Marquer qu'une déconnexion a eu lieu pour forcer la réauthentification
        localStorage.setItem('force_login', 'true')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Forcer la déconnexion locale même en cas d'erreur
      setUser(null)
      localStorage.setItem('force_login', 'true')
      window.location.href = '/'
    }
  }

  const isAdmin = user?.user_type === 'federation' || user?.user_type === 'company'

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
    checkAuth
  }
}