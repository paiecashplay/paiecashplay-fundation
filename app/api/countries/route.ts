import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Utiliser l'API REST Countries pour récupérer la liste des pays
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag', {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Erreur API pays')
    }

    const countries = await response.json()
    
    // Formater les données pour notre usage
    const formattedCountries = countries
      .map((country: any) => ({
        code: country.cca2,
        name: country.name.common,
        flag: country.flag
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
    
    return NextResponse.json({
      success: true,
      countries: formattedCountries
    })
  } catch (error) {
    console.error('Erreur récupération pays:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}