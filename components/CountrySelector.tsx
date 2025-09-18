'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface Country {
  code: string
  name: string
  flag: string
}

interface CountrySelectorProps {
  value: string
  onChange: (country: string) => void
  className?: string
}

export default function CountrySelector({ value, onChange, className = '' }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCountries()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCountries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data.countries || [])
      }
    } catch (error) {
      console.error('Erreur chargement pays:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCountry = countries.find(c => c.name === value || c.code === value)

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] flex items-center justify-between bg-white"
      >
        <div className="flex items-center space-x-2">
          {selectedCountry ? (
            <>
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-500">Sélectionner un pays</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:border-[#4FBA73] focus:ring-1 focus:ring-[#4FBA73] outline-none"
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucun pays trouvé</div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.name)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-gray-400 text-sm">({country.code})</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}