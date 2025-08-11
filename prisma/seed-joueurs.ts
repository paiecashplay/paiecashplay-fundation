import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedJoueurs() {
  const joueurs = [
    {
      prenom: 'Amadou',
      nom: 'Diallo',
      age: 16,
      position: 'Attaquant',
      club_nom: 'AS Bamako',
      pays_nom: 'Mali',
      photo_emoji: '⚽',
    },
    {
      prenom: 'Fatou',
      nom: 'Sow',
      age: 15,
      position: 'Milieu',
      club_nom: 'Dakar FC',
      pays_nom: 'Sénégal',
      photo_emoji: '🏃‍♀️',
    },
    {
      prenom: 'Kwame',
      nom: 'Asante',
      age: 17,
      position: 'Défenseur',
      club_nom: 'Accra United',
      pays_nom: 'Ghana',
      photo_emoji: '🛡️',
    },
    {
      prenom: 'Amina',
      nom: 'Traoré',
      age: 14,
      position: 'Gardien',
      club_nom: 'Ouagadougou Stars',
      pays_nom: 'Burkina Faso',
      photo_emoji: '🥅',
    },
    {
      prenom: 'Ibrahim',
      nom: 'Kone',
      age: 16,
      position: 'Ailier',
      club_nom: 'Abidjan Athletic',
      pays_nom: 'Côte d\'Ivoire',
      photo_emoji: '🏃‍♂️',
    },
  ];

  for (const joueur of joueurs) {
    await prisma.joueur.upsert({
      where: { 
        prenom_nom: {
          prenom: joueur.prenom,
          nom: joueur.nom,
        }
      },
      update: {},
      create: joueur,
    });
  }

  console.log('Joueurs créés avec succès');
}

seedJoueurs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });