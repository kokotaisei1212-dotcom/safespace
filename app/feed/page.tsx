'use client';

import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, update } from 'firebase/database';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  createdAt: string;
}

export default function FeedPage() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState('home');
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.values(data) as Post[];
        setPosts(postList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    });

    return () => unsubscribe();
  }, [user, router]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.email?.split('@')[0] || 'Anonymous',
          content,
        }),
      });

      if (!response.ok) throw new Error('Failed to post');
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const newLikedPosts = new Set(likedPosts);
    const isLiked = newLikedPosts.has(postId);
    
    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    try {
      const postRef = ref(database, `posts/${postId}`);
      const post = posts.find(p => p.id === postId);
      await update(postRef, {
        likes: isLiked ? Math.max(0, (post?.likes || 0) - 1) : (post?.likes || 0) + 1,
      });
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/join');
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#fff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #e5e5e5', 
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>SafeSpace</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e91e63',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          ログアウト
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
        {tab === 'home' && (
          <>
            {/* Post Form */}
            <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
              <form onSubmit={handlePost} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e91e63',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="何を思いますか？"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: 'none',
                      fontSize: '15px',
                      color: '#000',
                      minHeight: '40px',
                      fontFamily: 'inherit',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '20px',
                      resize: 'vertical',
                    }}
                  />
                  {error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '8px' }}>{error}</div>}
                  <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    style={{
                      marginTop: '12px',
                      padding: '8px 24px',
                      backgroundColor: '#e91e63',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      opacity: loading || !content.trim() ? 0.6 : 1,
                    }}
                  >
                    {loading ? '投稿中...' : '投稿'}
                  </button>
                </div>
              </form>
            </div>

            {/* Feed */}
            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <p style={{ fontSize: '15px', margin: 0 }}>投稿がまだありません</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      backgroundColor: '#e91e63',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>
                          {post.userName}
                        </span>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '15px', 
                        color: '#000', 
                        margin: '8px 0',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {post.content}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: '#666' }}>
                        <button
                          onClick={() => handleLike(post.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '15px',
                            color: likedPosts.has(post.id) ? '#e91e63' : '#666',
                            padding: 0,
                          }}
                        >
                          {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {tab === 'profile' && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: '#e91e63',
              margin: '0 auto 20px'
            }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>{user?.email}</p>
            <p style={{ fontSize: '14px', color: '#666' }}>メール確認済み</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid #e5e5e5',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
      }}>
        {[
          { key: 'home', icon: '🏠', label: 'ホーム' },
          { key: 'search', icon: '🔍', label: '検索' },
          { key: 'post', icon: '✏️', label: '投稿' },
          { key: 'likes', icon: '❤️', label: 'いいね' },
          { key: 'profile', icon: '👤', label: 'プロフィール' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: tab === key ? '#e91e63' : '#999',
              opacity: tab === key ? 1 : 0.6,
            }}
          >
            <div style={{ fontSize: '20px' }}>{icon}</div>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
