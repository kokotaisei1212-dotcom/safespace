export type TabType = 'home' | 'search' | 'messages' | 'profile' | 'settings' | 'explore' | 'creator';
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
  commentsDisabled?: boolean;
  likesDisabled?: boolean;
}

export interface Comment {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  likes?: number;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  image: string;
  timestamp: number;
  expiresAt: number;
  viewed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  website: string;
  avatar: string;
  verified: boolean;
  isCreator: boolean;
  privateAccount: boolean;
  followers: string[];
  following: string[];
  blocked: string[];
  totalPosts: number;
  monthlyEarnings: number;
  totalEarnings: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
  readAt?: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'tip';
  fromUserId: string;
  fromUserName: string;
  postId?: string;
  timestamp: number;
  read: boolean;
}

export interface Transaction {
  id: string;
  senderId: string;
  creatorId: string;
  type: 'tip' | 'subscription' | 'live';
  amount: number;
  fee: number;
  net: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
}

export interface Colors {
  bg: string;
  text: string;
  border: string;
  input: string;
  button: string;
  accent: string;
}
