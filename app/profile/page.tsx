'use client';

import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

interface UserProfile {
  name: string;
  bio: string;
  identityVerified: boolean;
  following?: { [key: string]: boolean };
  followers?: { [key: string]: boolean };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', bio: '', identityVerified: false });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      // プロフィール取得
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          identityVerified: data.identityVerified || false,
          following: data.following || {},
          followers: data.followers || {},
        });
        setStats({
          posts: Object.keys(data.posts || {}).length,
          followers: Object.keys(data.followers || {}).length,
          following: Object.keys(data.following || {}).length,
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, {
        name: profile.name,
        bio: profile.bio,
      });
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/join');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '80px' }}>
      {/* ヘッダー */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#000' }}>プロフィール</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>ログアウト</button>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* プロフィール画像 + 統計 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e91e63', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: 0 }}>
            {profile.name || user?.email}
            {profile.identityVerified && ' ✅'}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>{user?.email}</p>

          {/* 統計 */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: 0 }}>{stats.posts}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>投稿</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: 0 }}>{stats.followers}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>フォロワー</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#000', margin: 0 }}>{stats.following}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>フォロー中</p>
            </div>
          </div>
        </div>

        {/* 自己紹介 */}
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="名前"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#000' }}
            />
            <textarea
              placeholder="自己紹介"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', color: '#000', minHeight: '80px', fontFamily: 'inherit' }}
            />
            {error && <p style={{ color: '#d32f2f', fontSize: '12px', margin: 0 }}>{error}</p>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: '10px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                {loading ? '保存中...' : '保存'}
              </button>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#f0f0f0', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>キャンセル</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: '#333', margin: '0 0 16px 0', minHeight: '40px' }}>{profile.bio || '自己紹介がまだ登録されていません'}</p>
            <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '10px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              プロフィール編集
            </button>
          </>
        )}

        {/* 本人確認セクション */}
        {!profile.identityVerified && (
          <div style={{ backgroundColor: '#fff3e0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#e65100', marginBottom: '8px' }}>⚠️ 本人確認が必要です</p>
            <p style={{ fontSize: '13px', color: '#e65100', margin: '0 0 12px 0' }}>安全なコミュニティを保つため、マイナンバーカード、運転免許証、またはパスポートでの本人確認をお願いしています。</p>
            <button onClick={() => router.push('/verify')} style={{ width: '100%', padding: '10px', backgroundColor: '#e65100', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              本人確認を進める
            </button>
          </div>
        )}

        {profile.identityVerified && (
          <div style={{ backgroundColor: '#e8f5e9', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32', marginBottom: '8px' }}>✅ 本人確認済み</p>
            <p style={{ fontSize: '13px', color: '#2e7d32', margin: 0 }}>あなたのアカウントは本人確認済みです。安全なコミュニティ環境をご利用いただけます。</p>
          </div>
        )}
      </div>
    </div>
  );
}
