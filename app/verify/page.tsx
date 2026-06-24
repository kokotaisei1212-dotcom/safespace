'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, update } from 'firebase/database';

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    // URL パラメータから結果を確認
    const params = new URLSearchParams(window.location.search);
    const status = params.get('verification_status');

    if (status === 'verified') {
      handleVerificationSuccess();
    }
  }, [user, router]);

  const handleVerificationSuccess = async () => {
    if (!user) return;

    try {
      // Firebase を更新
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, {
        identityVerified: true,
        verifiedAt: new Date().toISOString(),
      });

      setVerified(true);
      setTimeout(() => router.push('/feed'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

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

      setSessionId(data.sessionId);

      // Stripe Identity Widget をロード
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/identity.js';
        script.async = true;
        document.head.appendChild(script);
      }

      // 少し遅延させて実行（スクリプトロード完了を待つ）
      setTimeout(() => {
        if (window.Stripe) {
          window.Stripe.redirectToVerificationSession({
            sessionId: data.sessionId,
          });
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '24px', color: '#000', marginBottom: '10px' }}>本人確認完了！</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>2秒後に Feed へ移動します</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px', color: '#000' }}>本人確認</h1>
        <p style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>
          安全なコミュニティを作るため、以下のいずれかで本人確認してください：
        </p>

        <div style={{ 
          backgroundColor: '#f9f9f9', 
          borderRadius: '12px', 
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0' }}>✅ 対応書類：</p>
          <ul style={{ fontSize: '13px', color: '#333', margin: 0, paddingLeft: '20px' }}>
            <li>マイナンバーカード</li>
            <li>運転免許証</li>
            <li>パスポート</li>
          </ul>
        </div>

        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleStartVerification}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#e91e63',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '12px',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '準備中...' : '本人確認を開始'}
        </button>

        <button
          onClick={() => router.push('/feed')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f0f0f0',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          あとで確認する
        </button>

        <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
          本人確認は随時実施できます。プロフィールページから確認できます。
        </p>
      </div>
    </div>
  );
}
