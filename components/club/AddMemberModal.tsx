'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Trophy } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (memberData: any) => Promise<void>
}

export default function AddMemberModal({ isOpen, onClose, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: 'FR',
    position: '',
    age: '',
    licenseNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const positions = [
    'Gardien de but',
    'Défenseur central',
    'Défenseur latéral',
    'Milieu défensif',
    'Milieu offensif',
    'Ailier',
    'Attaquant'
  ]

  const countries = [
    { code: 'FR', name: 'France' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'CI', name: 'Côte d\'Ivoire' },
    { code: 'MA', name: 'Maroc' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'TN', name: 'Tunisie' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) newErrors.email = 'Email requis'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide'
    
    if (!formData.firstName) newErrors.firstName = 'Prénom requis'
    if (!formData.lastName) newErrors.lastName = 'Nom requis'
    if (formData.age && (parseInt(formData.age) < 6 || parseInt(formData.age) > 50)) {
      newErrors.age = 'Âge doit être entre 6 et 50 ans'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        metadata: {
          position: formData.position,
          age: formData.age ? parseInt(formData.age) : undefined,
          licenseNumber: formData.licenseNumber
        }
      })
      
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        country: 'FR',
        position: '',
        age: '',
        licenseNumber: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error adding member:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un nouveau membre" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              icon={<User className="w-4 h-4" />}
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="Prénom du joueur"
            />
            
            <Input
              label="Nom *"
              icon={<User className="w-4 h-4" />}
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Nom du joueur"
            />
          </div>
          
          <Input
            label="Email *"
            type="email"
            icon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="email@exemple.com"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Téléphone"
              type="tel"
              icon={<Phone className="w-4 h-4" />}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Pays *</label>
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Informations sportives
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionner une position</option>
                {positions.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              label="Âge"
              type="number"
              min="6"
              max="50"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              error={errors.age}
              placeholder="18"
            />
          </div>
          
          <Input
            label="Numéro de licence"
            value={formData.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            placeholder="FR2024001"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<User className="w-4 h-4" />}
          >
            Ajouter le membre
          </Button>
        </div>
      </form>
    </Modal>
  )
}