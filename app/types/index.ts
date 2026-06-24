export type TabType = 'home' | 'search' | 'profile' | 'settings';
export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'ja';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  website: string;
  privateAccount: boolean;
}

export interface Colors {
  bg: string;
  text: string;
  border: string;
  input: string;
  button: string;
  accent: string;
}
