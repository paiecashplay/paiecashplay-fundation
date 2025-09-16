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

    // Écouter les mises à jour de profil
    const handleProfileUpdate = (event: CustomEvent) => {
      setUser(event.detail)
    }

    fetchUser()
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    }
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

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null)
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me?refresh=true', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      }
    } catch (error) {
      console.error('Erreur rafraîchissement utilisateur:', error)
    }
    return null
  }

  return { user, loading, login, logout, isAdmin, updateUser, refreshUser }
}