'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, X, Loader2, User, Mail, Lock, Trophy, FileText, ChevronDown, Search, Eye, EyeOff } from 'lucide-react'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (memberData: any) => Promise<void>
}

interface Country {
  code: string
  name: string
  flag: string
  dialCode: string
}

const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', dialCode: '+237' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', dialCode: '+225' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '+212' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '+213' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '+216' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', dialCode: '+27' },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬', dialCode: '+20' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', dialCode: '+44' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', dialCode: '+34' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '+32' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', dialCode: '+41' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'AR', name: 'Argentine', flag: '🇦🇷', dialCode: '+54' }
]

const positions = [
  { value: 'goalkeeper', label: 'Gardien', icon: '🥅' },
  { value: 'defender', label: 'Défenseur', icon: '🛡️' },
  { value: 'midfielder', label: 'Milieu', icon: '⚽' },
  { value: 'forward', label: 'Attaquant', icon: '🎯' }
]

function CountrySelect({ value, onChange }: { value: string; onChange: (country: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCountry = COUNTRIES.find(c => c.code === value)
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (country: Country) => {
    onChange(country.code)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-12 px-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-[#4FBA73] transition-colors"
      >
        <div className="flex items-center">
          {selectedCountry ? (
            <>
              <span className="text-lg mr-3">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Sélectionnez un pays</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleSelect(country)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors"
              >
                <span className="text-lg mr-3">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-sm text-gray-500">{country.code}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-center">
                Aucun pays trouvé
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PhoneInput({ value, onChange }: { value: string; onChange: (phone: string) => void }) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0])
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dialCode.includes(search) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (value && !phoneNumber) {
      const country = COUNTRIES.find(c => value.startsWith(c.dialCode))
      if (country) {
        setSelectedCountry(country)
        setPhoneNumber(value.substring(country.dialCode.length).trim())
      }
    }
  }, [value, phoneNumber])

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearch('')
    const fullPhone = phoneNumber ? `${country.dialCode} ${phoneNumber}` : ''
    onChange(fullPhone)
  }

  const handlePhoneChange = (phone: string) => {
    setPhoneNumber(phone)
    const fullPhone = phone ? `${selectedCountry.dialCode} ${phone}` : ''
    onChange(fullPhone)
  }

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-3 py-3 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 hover:bg-gray-100 focus:outline-none focus:border-[#4FBA73] transition-colors"
          >
            <span className="text-lg mr-2">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            <ChevronDown className={`ml-2 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-50 left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-80 max-h-60 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FBA73] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-48">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.dialCode}</div>
                    </div>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center text-sm">
                    Aucun pays trouvé
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="Numéro de téléphone"
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:outline-none focus:border-[#4FBA73] transition-colors bg-white"
        />
      </div>
    </div>
  )
}

export default function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    country: 'FR',
    phone: '',
    position: '',
    height: '',
    weight: '',
    birthDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation des champs requis
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis')
      setLoading(false)
      return
    }
    if (!formData.lastName.trim()) {
      setError('Le nom est requis')
      setLoading(false)
      return
    }
    if (formData.email.trim() && formData.password.trim() && formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    try {
      const memberData = {
        email: formData.email.trim() || undefined,
        password: formData.password.trim() || undefined,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        country: formData.country,
        phone: formData.phone.trim() || undefined,
        metadata: {
          position: formData.position || undefined,
          height: formData.height.trim() || undefined,
          weight: formData.weight.trim() || undefined,
          birthDate: formData.birthDate || undefined
        }
      }

      await onAdd(memberData)
      
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        country: 'FR',
        phone: '',
        position: '',
        height: '',
        weight: '',
        birthDate: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout')
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Ajouter un nouveau joueur</DialogTitle>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#4FBA73] to-[#3da562] px-8 py-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Nouveau Joueur</h2>
              <p className="text-white/80 text-lg mt-1">Ajouter un membre à l'équipe</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations personnelles */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Informations personnelles</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      Prénom *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="pl-10 h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                        placeholder="Prénom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Nom *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="pl-10 h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                        placeholder="Nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email <span className="text-gray-400">(optionnel)</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                        placeholder="email@exemple.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe <span className="text-gray-400">(optionnel)</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        minLength={8}
                        className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Pays
                    </Label>
                    <CountrySelect
                      value={formData.country}
                      onChange={(country) => setFormData(prev => ({ ...prev, country }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Téléphone
                    </Label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                    />
                  </div>
                </div>
              </div>

              {/* Informations sportives */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Informations sportives</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                      Poste
                    </Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-[#4FBA73] rounded-xl">
                        <div className="flex items-center">
                          <Trophy className="w-5 h-5 text-gray-400 mr-2" />
                          {positions.find(p => p.value === formData.position) ? (
                            <>
                              <span className="mr-2">{positions.find(p => p.value === formData.position)?.icon}</span>
                              <span>{positions.find(p => p.value === formData.position)?.label}</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Sélectionner</span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-xl">
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value} className="hover:bg-gray-50">
                            <div className="flex items-center">
                              <span className="mr-2">{position.icon}</span>
                              <span>{position.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                      Taille <span className="text-gray-400">(optionnel)</span>
                    </Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      className="h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                      placeholder="Ex: 175cm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                      Poids <span className="text-gray-400">(optionnel)</span>
                    </Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      className="h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                      placeholder="Ex: 70kg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                      Date de naissance <span className="text-gray-400">(optionnel)</span>
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="h-12 border-2 border-gray-200 focus:border-[#4FBA73] focus:ring-0 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-8 py-6">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 h-11 border-2 border-gray-300 hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 h-11 bg-gradient-to-r from-[#4FBA73] to-[#3da562] hover:from-[#3da562] hover:to-[#2d8f4f] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer le joueur
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}