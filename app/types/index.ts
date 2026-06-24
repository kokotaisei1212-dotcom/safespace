export type TabType = 'home' | 'search' | 'profile' | 'settings' | 'messages' | 'stories' | 'reels' | 'explore';
export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'ja';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
  shares: number;
  hashtags: string[];
}

export interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  media: string;
  timestamp: number;
  viewed: boolean;
}

export interface Reel {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  video: string;
  duration: number;
  caption: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  fromUser: string;
  timestamp: number;
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  website: string;
  avatar: string;
  privateAccount: boolean;
  verified: boolean;
  followers: string[];
  following: string[];
  blocked: string[];
}

export interface Colors {
  bg: string;
  text: string;
  border: string;
  input: string;
  button: string;
  primary: string;
  secondary: string;
  accent: string;
}
