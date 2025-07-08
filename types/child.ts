export interface Child {
  id: number;
  name: string;
  age: number;
  position: string;
  hasLicense: boolean;
  needsDonation: boolean;
  donationAmount: number;
  photo: string;
  joinDate: string;
  sponsor: string | null;
  country: string;
  club: string;
};