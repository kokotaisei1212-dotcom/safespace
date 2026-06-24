'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', color: '#000', marginBottom: '20px' }}>セーフスペース</h1>

        {/* 投稿フォーム */}
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <textarea
              placeholder="何か言いたいことはありますか？"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#000',
                minHeight: '80px',
                fontFamily: 'inherit',
              }}
            />

            {error && <div style={{ color: '#d32f2f', fontSize: '12px' }}>{error}</div>}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              style={{
                padding: '10px',
                backgroundColor: '#e91e63',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {loading ? '投稿中...' : '投稿'}
            </button>
          </form>
        </div>

        {/* 投稿一覧 */}
        <div>
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
              まだ投稿がありません。最初の投稿者になりましょう！
            </p>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  borderLeft: '4px solid #e91e63',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#000' }}>{post.userName}</strong>
                  <small style={{ color: '#999' }}>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
                <p style={{ color: '#333', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                <button
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#fff',
                    border: '1px solid #e91e63',
                    color: '#e91e63',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ❤️ {post.likes}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
