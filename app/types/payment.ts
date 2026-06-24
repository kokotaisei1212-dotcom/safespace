export interface PaymentFlow {
  senderId: string;
  creatorId: string;
  amount: number;
  fee: number; // SafeSpace 取分
  net: number; // Creator 取分
  method: 'card' | 'apple_pay' | 'google_pay';
  status: 'pending' | 'completed' | 'failed';
  stripePaymentId: string;
  timestamp: number;
}

export interface UserPaymentSettings {
  userId: string;
  stripeCustomerId: string;
  paymentMethods: PaymentMethod[];
  defaultMethod: string;
  billingHistory: PaymentFlow[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
}

export interface CreatorPayoutSettings {
  creatorId: string;
  stripeConnectId: string;
  bankAccount: {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
  };
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
  minimumPayout: number;
  nextPayoutDate: number;
  totalPending: number;
  totalPaidOut: number;
}

export interface AdminDashboard {
  totalRevenue: number;
  platformFees: number; // SafeSpace の取分
  creatorPayouts: number;
  activeUsers: number;
  activeCreators: number;
  dailyRevenue: Record<string, number>;
  topCreators: Array<{ creatorId: string; earnings: number }>;
}
