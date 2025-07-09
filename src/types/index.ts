export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  isVisible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  description: string;
  updatedAt: string;
}