// Données simulées des licences attribuées
export const licensesData = [
  {
    childId: 2,
    childName: 'Fatou Sall',
    packType: 'License Solidaire',
    club: 'Casa Sports',
    country: 'Sénégal',
    assignedDate: '2023-09-20'
  },
  {
    childId: 5,
    childName: 'Kwame Asante',
    packType: 'Champion Equipment',
    club: 'Hearts of Oak',
    country: 'Ghana',
    assignedDate: '2024-01-20'
  },
  {
    childId: 7,
    childName: 'Amina Kone',
    packType: 'Champion Equipment',
    club: 'ASEC Mimosas',
    country: 'Côte d\'Ivoire',
    assignedDate: '2024-02-15'
  },
  {
    childId: 9,
    childName: 'Ibrahim Traore',
    packType: 'Champion Equipment',
    club: 'Real Bamako',
    country: 'Mali',
    assignedDate: '2024-03-10'
  }
];

// Données simulées du total d'enfants
export const totalChildren = 12847;

// Fonction pour calculer les statistiques des licences
export function getLicenseStats() {
  const championEquipmentCount = licensesData.filter(
    license => license.packType === 'Champion Equipment'
  ).length;
  
  const licenseSolidaireCount = licensesData.filter(
    license => license.packType === 'License Solidaire'
  ).length;
  
  const dailyEnergyCount = licensesData.filter(
    license => license.packType === 'Daily Energy'
  ).length;
  
  const talentJourneyCount = licensesData.filter(
    license => license.packType === 'Talent Journey'
  ).length;
  
  const tomorrowsTrainingCount = licensesData.filter(
    license => license.packType === 'Tomorrow\'s Training'
  ).length;

  return {
    championEquipment: championEquipmentCount,
    licenseSolidaire: licenseSolidaireCount,
    dailyEnergy: dailyEnergyCount,
    talentJourney: talentJourneyCount,
    tomorrowsTraining: tomorrowsTrainingCount,
    total: licensesData.length,
    totalChildren
  };
}

// Fonction pour ajouter une nouvelle licence (simulation)
export function addLicense(childId: number, childName: string, packType: string, club: string, country: string) {
  licensesData.push({
    childId,
    childName,
    packType,
    club,
    country,
    assignedDate: new Date().toISOString().split('T')[0]
  });
}