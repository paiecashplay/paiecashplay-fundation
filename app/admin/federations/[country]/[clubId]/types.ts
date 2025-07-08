export type Child = {
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

export type ClubData = {
  clubName: string;
  city: string;
  country: string;
  children: Child[];
};
