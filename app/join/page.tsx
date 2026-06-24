'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('test@safespace.jp');
  const [password, setPassword] = useState('Password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const router = useRouter();
  const firebaseAuth = getAuth();

  useEffect(() => {
    const user = firebaseAuth.currentUser;
    if (user) {
      router.push('/feed');
    }
  }, [firebaseAuth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        // ログイン
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        router.push('/feed');
      } else {
        // 登録
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;

        await set(ref(database, `users/${user.uid}`), {
          id: user.uid,
          email,
          name: name || email.split('@')[0],
          createdAt: new Date().toISOString(),
          emailVerified: email === 'test@safespace.jp',
          identityVerified: email === 'test@safespace.jp',
        });

        router.push('/feed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px', color: '#000' }}>
          {mode === 'login' ? 'ログイン' : 'アカウントを作成する'}
        </h1>
        <p style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>女性限定</p>

        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#000',
              }}
            />
          )}

          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#000',
            }}
          />

          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#000',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              backgroundColor: '#e91e63',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '10px',
              fontWeight: '600',
            }}
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '続く'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
          {mode === 'login' ? (
            <>
              アカウントをお持ちでないですか？{' '}
              <button
                onClick={() => setMode('register')}
                style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', textDecoration: 'underline' }}
              >
                登録する
              </button>
            </>
          ) : (
            <>
              アカウントをお持ちですか？{' '}
              <button
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#e91e63', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ログイン
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
