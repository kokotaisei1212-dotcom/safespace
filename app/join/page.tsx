'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ユーザー情報を Realtime Database に保存
      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        email,
        name,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        identityVerified: false,
      });

      // メール確認メールを送信
      await sendEmailVerification(user);

      setMessage('確認メールを送信しました。メールをご確認ください。本人確認ページへリダイレクトします。');
      
      // 3秒後に本人確認ページへリダイレクト
      setTimeout(() => {
        router.push('/verify');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', width: '100%', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px', color: '#000' }}>アカウントを作成する</h1>
        <p style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>女性限定</p>

        {error && (
          <div style={{ color: '#d32f2f', marginBottom: '15px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ color: '#4caf50', marginBottom: '15px', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#000',
            }}
          />

          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
            }}
          >
            {loading ? '登録中...' : '続く'}
          </button>
        </form>

        <p style={{ fontSize: '12px', color: '#333', marginTop: '20px' }}>
          ご登録いただくことで、あなたが女性であることを確認したことになります。
        </p>
      </div>
    </div>
  );
}
