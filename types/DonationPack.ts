// types/DonationPack.ts
export interface DonationPack {
  id: string; 
  nom: string;
  prix: number;
  description: string;
  avantages: string[] | string;
  icone_fa: string;
  couleur_fond: string;
  couleur_icone: string;
  couleur_bouton: string;
  type_recurrence: string;
  code?: string;
}


