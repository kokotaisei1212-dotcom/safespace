'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
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
  likedBy?: { [key: string]: boolean };
}

export default function FeedPage() {
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    // Firebase から投稿を取得
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
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    // Firebase を更新
    try {
      const postRef = ref(database, `posts/${postId}`);
      const isLiked = newLikedPosts.has(postId);
      await update(postRef, {
        likes: isLiked ? (posts.find(p => p.id === postId)?.likes || 0) + 1 : Math.max(0, (posts.find(p => p.id === postId)?.likes || 0) - 1),
      });
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ 
        borderBottom: '1px solid #e5e5e5', 
        padding: '16px 0', 
        position: 'sticky', 
        top: 0, 
        backgroundColor: '#fff',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingLeft: '16px', paddingRight: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', margin: 0 }}>セーフスペース</h1>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* 投稿作成フォーム */}
        <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
          <form onSubmit={handlePost} style={{ display: 'flex', gap: '16px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
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
                  fontSize: '16px',
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
                  padding: '8px 20px',
                  backgroundColor: '#e91e63',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: loading || !content.trim() ? 0.5 : 1,
                }}
              >
                {loading ? '投稿中...' : '投稿'}
              </button>
            </div>
          </form>
        </div>

        {/* フィード */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <p style={{ fontSize: '16px' }}>投稿がありません</p>
            <p style={{ fontSize: '14px' }}>最初の投稿者になりましょう！</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
              {/* 投稿ヘッダー */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e91e63'
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#000' }}>{post.userName}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '20px', cursor: 'pointer' }}>⋯</div>
              </div>

              {/* 投稿内容 */}
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#000', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </div>

              {/* アクション */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: 0,
                  }}
                >
                  {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}>
                  💬
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0 }}>
                  ↗️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
