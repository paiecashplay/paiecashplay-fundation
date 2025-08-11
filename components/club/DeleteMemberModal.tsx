'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import type { ClubMember } from '@/lib/services/clubService'

interface DeleteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (memberId: string) => Promise<void>
  member: ClubMember | null
}

export default function DeleteMemberModal({ isOpen, onClose, onDelete, member }: DeleteMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!member) return
    
    setLoading(true)
    setError(null)

    try {
      await onDelete(member.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setError(null)
      onClose()
    }
  }

  if (!member) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Confirmer la suppression</DialogTitle>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-6 py-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Supprimer le joueur</h2>
              <p className="text-red-100 text-sm mt-1">Cette action est irréversible</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">
                {member.firstName[0]}{member.lastName[0]}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-gray-600 text-sm">{member.email}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm text-center">
              Êtes-vous sûr de vouloir supprimer ce joueur ? Toutes ses données, licences et donations seront définitivement perdues.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border-gray-300 hover:bg-gray-100"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}