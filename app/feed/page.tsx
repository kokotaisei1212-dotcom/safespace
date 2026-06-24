'use client';

import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, update, get } from 'firebase/database';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  comments?: { [key: string]: any };
  createdAt: string;
}

export default function FeedPage() {
  const [tab, setTab] = useState('home');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<{ [key: string]: any }>({});
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const following = snapshot.val().following || {};
        setFollowing(new Set(Object.keys(following)));
      }
    });

    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));
        setPosts(postList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    });

    const usersRef = ref(database, 'users');
    const unsubscribe2 = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllUsers(data);
      }
    });

    return () => {
      unsubscribe();
      unsubscribe2();
    };
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
          userName: user.email?.split('@')[0] || 'User',
          content,
        }),
      });

      if (!response.ok) throw new Error('投稿に失敗しました');
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
    const post = posts.find(p => p.id === postId);
    const isCurrentlyLiked = newLikedPosts.has(postId);
    
    if (isCurrentlyLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);

    try {
      const postRef = ref(database, `posts/${postId}`);
      await update(postRef, {
        likes: isCurrentlyLiked ? Math.max(0, (post?.likes || 0) - 1) : (post?.likes || 0) + 1,
      });
    } catch (err) {
      console.error('いいね失敗:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentContent = commentTexts[postId];
    if (!commentContent?.trim() || !user) return;

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: user.uid,
          userName: user.email?.split('@')[0] || 'User',
          content: commentContent,
        }),
      });

      setCommentTexts({ ...commentTexts, [postId]: '' });
    } catch (err) {
      console.error('コメント失敗:', err);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;

    const newFollowing = new Set(following);
    const isFollowing = newFollowing.has(targetUserId);

    if (isFollowing) {
      newFollowing.delete(targetUserId);
    } else {
      newFollowing.add(targetUserId);
    }
    setFollowing(newFollowing);

    try {
      await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          targetUserId,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
    } catch (err) {
      console.error('フォロー失敗:', err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/join');
  };

  if (tab === 'home') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
        {/* ヘッダー */}
        <div style={{ borderBottom: '1px solid #262626', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#262626', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>ログアウト</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
          {/* 投稿フォーム */}
          <div style={{ borderBottom: '1px solid #262626', padding: '16px', backgroundColor: '#000' }}>
            <form onSubmit={handlePost} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <textarea 
                  placeholder="何か思いついた？" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  style={{ width: '100%', padding: '12px', border: '1px solid #262626', fontSize: '15px', color: '#fff', minHeight: '40px', fontFamily: 'inherit', backgroundColor: '#262626', borderRadius: '20px', resize: 'vertical' }} 
                />
                {error && <div style={{ color: '#f91880', fontSize: '12px', marginTop: '8px' }}>{error}</div>}
                <button 
                  type="submit" 
                  disabled={loading || !content.trim()} 
                  style={{ marginTop: '12px', padding: '8px 24px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', opacity: loading || !content.trim() ? 0.5 : 1 }}>
                  {loading ? '投稿中...' : '投稿'}
                </button>
              </div>
            </form>
          </div>

          {/* フィード */}
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ fontSize: '15px', margin: 0 }}>投稿がまだありません</p>
              <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>最初の投稿者になってください</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} style={{ borderBottom: '1px solid #262626', padding: '12px 16px', backgroundColor: '#000' }}>
                {/* 投稿ヘッダー */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{post.userName}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>
                  {post.userId !== user?.uid && (
                    <button 
                      onClick={() => handleFollow(post.userId)} 
                      style={{ padding: '6px 12px', background: following.has(post.userId) ? 'transparent' : 'linear-gradient(45deg, #f09433, #e6683c)', color: following.has(post.userId) ? '#999' : '#fff', border: following.has(post.userId) ? '1px solid #262626' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      {following.has(post.userId) ? 'フォロー中' : 'フォロー'}
                    </button>
                  )}
                </div>

                {/* 投稿内容 */}
                <p style={{ fontSize: '15px', color: '#fff', margin: '12px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</p>

                {/* アクション */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', color: '#999', paddingTop: '12px', borderTop: '1px solid #262626' }}>
                  <button 
                    onClick={() => handleLike(post.id)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: likedPosts.has(post.id) ? '#f91880' : '#999', padding: 0 }}>
                    {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button 
                    onClick={() => setExpandedComments(new Set(expandedComments).add(post.id))} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#999', padding: 0 }}>
                    💬 {Object.keys(post.comments || {}).length}
                  </button>
                </div>

                {/* コメント */}
                {expandedComments.has(post.id) && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #262626' }}>
                    {Object.values(post.comments || {}).map((comment: any) => (
                      <div key={comment.id} style={{ marginBottom: '12px', fontSize: '14px' }}>
                        <strong style={{ color: '#fff' }}>{comment.userName}</strong>
                        <p style={{ color: '#ccc', margin: '4px 0' }}>{comment.content}</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input 
                        type="text" 
                        placeholder="コメントを追加..." 
                        value={commentTexts[post.id] || ''} 
                        onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} 
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #262626', borderRadius: '20px', fontSize: '14px', color: '#fff', backgroundColor: '#262626' }} 
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)} 
                        style={{ padding: '8px 16px', background: 'linear-gradient(45deg, #f09433, #e6683c)', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>
                        送信
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ボトムナビゲーション */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #262626', backgroundColor: '#000', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[
            { key: 'home', icon: '🏠', label: 'ホーム' },
            { key: 'search', icon: '🔍', label: '検索' },
            { key: 'messages', icon: '💬', label: 'DM' },
            { key: 'profile', icon: '👤', label: 'プロフ' },
          ].map(({ key, icon, label }) => (
            <button 
              key={key} 
              onClick={() => {
                if (key === 'messages') router.push('/messages');
                else if (key === 'profile') router.push('/profile');
                else setTab(key);
              }} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '12px', color: tab === key ? '#fff' : '#999', opacity: tab === key ? 1 : 0.6 }}>
              <div style={{ fontSize: '20px' }}>{icon}</div>{label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'search') {
    const filteredUsers = Object.entries(allUsers)
      .filter(([id, u]: any) => id !== user?.uid && (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())))
      .map(([id, u]: any) => ({ id, ...u }));

    return (
      <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
        <input 
          type="text" 
          placeholder="ユーザーを検索..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={{ width: 'calc(100% - 32px)', padding: '12px', border: '1px solid #262626', borderRadius: '20px', fontSize: '15px', color: '#fff', margin: '16px', backgroundColor: '#262626' }} 
        />
        {filteredUsers.map((u: any) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #262626' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>{u.name}</p>
              <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>{u.email}</p>
            </div>
            <button 
              onClick={() => handleFollow(u.id)} 
              style={{ padding: '6px 16px', background: following.has(u.id) ? 'transparent' : 'linear-gradient(45deg, #f09433, #e6683c)', color: following.has(u.id) ? '#999' : '#fff', border: following.has(u.id) ? '1px solid #262626' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
              {following.has(u.id) ? 'フォロー中' : 'フォロー'}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
