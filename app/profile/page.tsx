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
  const [tab, setTab] = useState('posts');
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
      console.error('プロフィール読み込み失敗:', err);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '80px' }}>
      {/* ヘッダー */}
      <div style={{ borderBottom: '1px solid #262626', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>プロフィール</h1>
        <button 
          onClick={handleLogout} 
          style={{ padding: '8px 16px', backgroundColor: '#262626', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
          ログアウト
        </button>
      </div>

      {/* バナー */}
      <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743)', position: 'relative' }} />

      {/* プロフィール情報 */}
      <div style={{ padding: '0 16px', marginTop: '-50px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', border: '3px solid #000' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {editing ? (
              <button 
                onClick={handleSave} 
                disabled={loading}
                style={{ padding: '10px 20px', backgroundColor: '#e6683c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                {loading ? '保存中...' : '保存'}
              </button>
            ) : (
              <button 
                onClick={() => setEditing(true)}
                style={{ padding: '10px 20px', backgroundColor: '#262626', color: '#fff', border: '1px solid #262626', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                編集
              </button>
            )}
            <button 
              onClick={() => router.push('/verify')}
              style={{ padding: '10px 20px', backgroundColor: '#262626', color: '#fff', border: '1px solid #262626', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              確認
            </button>
          </div>
        </div>

        {/* ユーザー名と認証バッジ */}
        <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {profile.name || user?.email}
          {profile.identityVerified && <span style={{ fontSize: '16px' }}>✅</span>}
        </p>
        <p style={{ fontSize: '13px', color: '#999', margin: '0 0 16px 0' }}>{user?.email}</p>

        {/* 統計 */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #262626' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{stats.posts}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>投稿</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{stats.followers}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>フォロワー</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{stats.following}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>フォロー中</p>
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
              style={{ padding: '12px', border: '1px solid #262626', borderRadius: '8px', fontSize: '14px', color: '#fff', backgroundColor: '#262626' }}
            />
            <textarea
              placeholder="自己紹介"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              style={{ padding: '12px', border: '1px solid #262626', borderRadius: '8px', fontSize: '14px', color: '#fff', backgroundColor: '#262626', minHeight: '80px', fontFamily: 'inherit' }}
            />
            {error && <p style={{ color: '#f91880', fontSize: '12px', margin: 0 }}>{error}</p>}
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '10px 20px', backgroundColor: '#262626', color: '#fff', border: '1px solid #262626', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              キャンセル
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '20px', minHeight: '40px' }}>
            {profile.bio || '自己紹介がまだ設定されていません'}
          </p>
        )}

        {/* 本人確認状態 */}
        {profile.identityVerified ? (
          <div style={{ backgroundColor: '#1a3a1a', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#4caf50', margin: 0 }}>✅ 本人確認済み</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#3a2a1a', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#ff9800', margin: 0 }}>⚠️ 本人確認が必要です</p>
          </div>
        )}
      </div>

      {/* タブ */}
      <div style={{ borderTop: '1px solid #262626', borderBottom: '1px solid #262626', display: 'flex', padding: '0 16px' }}>
        {['posts', 'saved'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              color: tab === t ? '#fff' : '#999',
              border: 'none',
              borderBottom: tab === t ? '2px solid #fff' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}>
            {t === 'posts' ? '投稿' : '保存済み'}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div style={{ padding: '20px 16px', textAlign: 'center', color: '#999' }}>
        {tab === 'posts' ? (
          <p>投稿がありません</p>
        ) : (
          <p>保存済みのコンテンツがありません</p>
        )}
      </div>
    </div>
  );
}
