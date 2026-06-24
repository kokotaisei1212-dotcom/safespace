import { useState, useCallback } from 'react';
import { Transaction, Subscription } from '@/app/types';

export const useStripe = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const sendTip = useCallback(async (creatorId: string, senderId: string, amount: number) => {
    const fee = Math.round(amount * 0.15);
    const net = amount - fee;

    const transaction: Transaction = {
      id: Date.now().toString(),
      creatorId,
      type: 'tip',
      amount,
      fee,
      net,
      timestamp: Date.now(),
      status: 'completed',
    };

    setTransactions([...transactions, transaction]);

    try {
      const response = await fetch('/api/payments/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, senderId, amount }),
      });
      return response.ok;
    } catch (error) {
      console.error('Tip failed:', error);
      return false;
    }
  }, [transactions]);

  const subscribe = useCallback(async (creatorId: string, subscriberId: string, price: number) => {
    const subscription: Subscription = {
      id: Date.now().toString(),
      creatorId,
      subscriberId,
      price,
      status: 'active',
      startDate: Date.now(),
      nextBillingDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    setSubscriptions([...subscriptions, subscription]);

    try {
      const response = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, subscriberId, price }),
      });
      return response.ok;
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  }, [subscriptions]);

  const getEarnings = useCallback((creatorId: string) => {
    const creatorTransactions = transactions.filter(t => t.creatorId === creatorId && t.status === 'completed');
    const total = creatorTransactions.reduce((sum, t) => sum + t.net, 0);
    const monthly = creatorTransactions
      .filter(t => Date.now() - t.timestamp < 30 * 24 * 60 * 60 * 1000)
      .reduce((sum, t) => sum + t.net, 0);

    return { total, monthly, transactions: creatorTransactions };
  }, [transactions]);

  return { transactions, subscriptions, sendTip, subscribe, getEarnings };
};
