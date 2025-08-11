import { useState, useEffect } from 'react'
import type { User } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = () => {
    window.location.href = '/api/auth/login'
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Fallback: redirection directe
      window.location.href = '/api/auth/logout'
    }
  }

  const isAdmin = user?.user_type === 'admin'

  return { user, loading, login, logout, isAdmin }
}