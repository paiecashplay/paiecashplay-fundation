const { PrismaClient } = require('@prisma/client');

async function seed() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Seeding production database...');
    
    // Vérifier si des packs existent déjà
    const existingPacks = await prisma.packDonation.count()
    
    if (existingPacks > 0) {
      console.log('Packs de donation déjà présents, seed ignoré.')
      return
    }

    // Créer les packs de donation seulement s'ils n'existent pas
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


    console.log('✅ Production database seeded successfully');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});