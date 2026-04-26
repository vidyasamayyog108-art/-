export type Language = 'mr' | 'hi' | 'kn' | 'en';

export interface UserProfile {
  uid: string;
  phoneNumber: string;
  fullName: string;
  subCaste: string;
  gotra: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: 'male' | 'female';
  profilePhotoUrl?: string;
  extraPhotoUrls?: string[];
  horoscopePhotoUrl?: string;
  education: string;
  occupation: string;
  height: string;
  weight: string;
  bloodGroup: string;
  isPremium: boolean;
  status: 'pending' | 'approved' | 'blocked';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    minAge: number;
    maxAge: number;
    requiredEducation?: string;
    preferredNativePlace?: string;
  };
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Ad {
  id: string;
  imageUrl: string;
  targetUrl?: string;
  targetPhone?: string;
  views: number;
  clicks: number;
}

export interface SuccessStory {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export interface AppSettings {
  marqueeText: Record<Language, string>;
  membershipPrice: number;
}
