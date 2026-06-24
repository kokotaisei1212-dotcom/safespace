import { useState, useCallback } from 'react';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendTip = useCallback(async (senderId: string, creatorId: string, amount: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/payments/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, creatorId, amount }),
      });
      if (!response.ok) {
        throw new Error('Tip failed');
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPayout = useCallback(async (creatorId: string, amount: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/payments/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, amount }),
      });
      if (!response.ok) {
        throw new Error('Payout request failed');
      }
      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, sendTip, requestPayout };
};
