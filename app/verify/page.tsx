'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/join');
    }
  }, [auth, router]);

  const handleStartVerification = async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // API を呼んで Verification Session を作成
      const response = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Stripe Identity Widget を動的にロード
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/identity.js';
      script.async = true;
      script.onload = () => {
        const stripe = (window as any).Stripe;
        if (stripe) {
          stripe.redirectToVerificationSession({
            sessionId: data.sessionId,
          });
        }
      };
      document.body.appendChild(script);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px', color: '#000' }}>本人確認</h1>
        <p style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>
          マイナンバーカード、運転免許証、またはパスポートで本人確認してください。
        </p>

        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {verified && (
          <div style={{ color: '#4caf50', marginBottom: '15px', fontSize: '14px' }}>
            本人確認が完了しました！
          </div>
        )}

        <button
          onClick={handleStartVerification}
          disabled={loading || verified}
          style={{
            padding: '12px',
            backgroundColor: '#e91e63',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          {loading ? '処理中...' : '本人確認を開始'}
        </button>
      </div>
    </div>
  );
}
