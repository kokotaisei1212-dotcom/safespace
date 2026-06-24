'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const handleStartVerification = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          email: user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Stripe Identity ウィジェットをロード＆実行
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/identity.js';
      script.onload = () => {
        const stripe = (window as any).Stripe;
        if (stripe) {
          stripe.redirectToVerificationSession({
            sessionId: data.sessionId,
            redirectUrl: `${window.location.origin}/verify?session_id=${data.sessionId}`,
          });
        }
      };
      document.head.appendChild(script);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId || !user) return;

    try {
      const response = await fetch(`/api/identity?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.verified) {
        // Firebase を更新
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, {
          identityVerified: true,
          verifiedAt: new Date().toISOString(),
        });

        setVerified(true);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err) {
      console.error('認証確認失敗:', err);
    }
  };

  if (verified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>本人確認完了！</h1>
          <p style={{ color: '#999' }}>2秒後に戻ります</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px' }}>本人確認</h1>

        <div style={{ backgroundColor: '#262626', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', color: '#999', margin: '0 0 12px 0' }}>✅ 対応書類：</p>
          <ul style={{ fontSize: '13px', color: '#ccc', margin: 0, paddingLeft: '20px' }}>
            <li>マイナンバーカード</li>
            <li>運転免許証</li>
            <li>パスポート</li>
          </ul>
        </div>

        {error && <div style={{ color: '#f91880', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <button
          onClick={handleStartVerification}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(45deg, #f09433, #e6683c)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
            opacity: loading ? 0.6 : 1,
          }}>
          {loading ? '準備中...' : '本人確認を開始'}
        </button>

        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#262626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
          }}>
          あとで確認する
        </button>

        <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
          本人確認は随時実施できます。
        </p>
      </div>
    </div>
  );
}
