export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  socials?: {
    instagram?: string;
    twitter?: string;
  };
}
