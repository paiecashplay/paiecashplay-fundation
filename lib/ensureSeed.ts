import { prisma } from './prisma'

export async function ensureSeedData() {
  try {
    // Vérifier si des packs existent déjà
    const existingPacks = await prisma.packDonation.count()
    
    if (existingPacks > 0) {
      return // Les données existent déjà
    }

    // Créer les packs de donation par défaut
    await prisma.packDonation.createMany({
      data: [
        {
          nom: 'License Solidaire',
          code: 'licenseDream',
          description: 'Inscription saison sportive officielle',
          prix: 50.00,
          devise: 'EUR',
          type_recurrence: 'mensuel',
          icone_fa: 'faIdCard',
          couleur_icone: '#10B981',
          couleur_fond: '#DCFCE7',
          couleur_bouton: '#10B981',
          avantages: ['Nom et photo enfant', 'Mises à jour progrès', 'Certificat parrainage'],
          ordre_affichage: 1
        },
        {
          nom: 'Champion Equipment',
          code: 'championEquipment',
          description: 'Kit complet équipement',
          prix: 100.00,
          devise: 'EUR',
          type_recurrence: 'unique',
          icone_fa: 'faTshirt',
          couleur_icone: '#EA580C',
          couleur_fond: '#FED7AA',
          couleur_bouton: '#EA580C',
          avantages: ['Photo équipement', 'Vidéo remerciement', 'Mur des héros'],
          ordre_affichage: 2
        },
        {
          nom: 'Daily Energy',
          code: 'dailyEnergy',
          description: 'Repas équilibrés et collations',
          prix: 10.00,
          devise: 'EUR',
          type_recurrence: 'mensuel',
          icone_fa: 'faAppleAlt',
          couleur_icone: '#10B981',
          couleur_fond: '#DCFCE7',
          couleur_bouton: '#10B981',
          avantages: ['Rapports impact', 'Suivi nutrition', 'Amélioration santé'],
          ordre_affichage: 3
        }
      ]
    })

    console.log('Données de seed créées automatiquement')
  } catch (error) {
    console.error('Erreur lors de la création des données de seed:', error)
  }
}