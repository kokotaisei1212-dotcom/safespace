import { useState, useCallback } from 'react';

export const useReferral = () => {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<string[]>([]);

  const generateReferralCode = useCallback((userId: string) => {
    const code = `REF_${userId.substring(0, 8).toUpperCase()}`;
    setReferralCode(code);
    return code;
  }, []);

  const trackReferral = useCallback((code: string, newUserId: string) => {
    setReferrals([...referrals, newUserId]);
  }, [referrals]);

  return { referralCode, referrals, generateReferralCode, trackReferral };
};
