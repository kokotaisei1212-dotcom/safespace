export type TabType = 'home' | 'search' | 'profile' | 'settings' | 'messages' | 'explore' | 'creator_dashboard' | 'earnings';
export type Theme = 'dark' | 'light';
export type Lang = 'en' | 'ja';

export interface Creator {
  id: string;
  userId: string;
  bio: string;
  totalEarnings: number;
  monthlyEarnings: number;
  followers: number;
  posts: number;
  engagementRate: number;
  bankAccount?: {
    accountNumber: string;
    routingNumber: string;
  };
  subscriptionPrice?: number;
  stripeConnectId?: string;
}

export interface Transaction {
  id: string;
  creatorId: string;
  type: 'tip' | 'subscription' | 'live' | 'payout';
  amount: number;
  fee: number;
  net: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface Subscription {
  id: string;
  creatorId: string;
  subscriberId: string;
  price: number;
  status: 'active' | 'cancelled';
  startDate: number;
  nextBillingDate: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
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

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  fromUser: string;
  timestamp: number;
  read: boolean;
}

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
  tipsReceived?: number;
  exclusive?: boolean;
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
  avatar: string;
  privateAccount: boolean;
  verified: boolean;
  followers: string[];
  following: string[];
  blocked: string[];
  isCreator?: boolean;
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
