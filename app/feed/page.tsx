'use client';

import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, update, get } from 'firebase/database';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  comments?: { [key: string]: Comment };
  createdAt: string;
}

interface UserData {
  name: string;
  email: string;
  identityVerified: boolean;
  following?: { [key: string]: boolean };
  followers?: { [key: string]: boolean };
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
  const [allUsers, setAllUsers] = useState<{ [key: string]: UserData }>({});
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  // 初期化
  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    // 自分のプロフィール取得
    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setProfileData(snapshot.val());
        const following = snapshot.val().following || {};
        setFollowing(new Set(Object.keys(following)));
      }
    });

    // 投稿を取得
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

    // 全ユーザー取得
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

  // 投稿作成
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

  // いいね処理
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

  // コメント追加
  const handleAddComment = async (postId: string) => {
    const commentContent = commentTexts[postId];
    if (!commentContent?.trim() || !user) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: user.uid,
          userName: user.email?.split('@')[0] || 'Anonymous',
          content: commentContent,
        }),
      });

      if (response.ok) {
        setCommentTexts({ ...commentTexts, [postId]: '' });
      }
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  // フォロー処理
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
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          targetUserId,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  // ログアウト
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/join');
  };

  // ホームタブ
  if (tab === 'home') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff' }}>
        <div style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>SafeSpace</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>ログアウト</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
          {/* 投稿フォーム */}
          <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
            <form onSubmit={handlePost} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e91e63', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <textarea placeholder="何を思いますか？" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '12px', border: 'none', fontSize: '15px', color: '#000', minHeight: '40px', fontFamily: 'inherit', backgroundColor: '#f0f0f0', borderRadius: '20px', resize: 'vertical' }} />
                {error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '8px' }}>{error}</div>}
                <button type="submit" disabled={loading || !content.trim()} style={{ marginTop: '12px', padding: '8px 24px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', opacity: loading || !content.trim() ? 0.6 : 1 }}>
                  {loading ? '投稿中...' : '投稿'}
                </button>
              </div>
            </form>
          </div>

          {/* フィード */}
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ fontSize: '15px', margin: 0 }}>投稿がまだありません</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e91e63' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>{post.userName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>
                  {post.userId !== user?.uid && (
                    <button onClick={() => handleFollow(post.userId)} style={{ padding: '6px 12px', backgroundColor: following.has(post.userId) ? '#f0f0f0' : '#e91e63', color: following.has(post.userId) ? '#000' : '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      {following.has(post.userId) ? 'フォロー中' : 'フォロー'}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '15px', color: '#000', margin: '12px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</p>

                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', color: '#666' }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: likedPosts.has(post.id) ? '#e91e63' : '#666', padding: 0 }}>
                    {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button onClick={() => setExpandedComments(new Set(expandedComments).add(post.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: 0 }}>
                    💬 {Object.keys(post.comments || {}).length}
                  </button>
                </div>

                {/* コメント表示 */}
                {expandedComments.has(post.id) && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
                    {Object.values(post.comments || {}).map((comment: any) => (
                      <div key={comment.id} style={{ marginBottom: '12px', fontSize: '14px' }}>
                        <strong style={{ color: '#000' }}>{comment.userName}</strong>
                        <p style={{ color: '#333', margin: '4px 0' }}>{comment.content}</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input type="text" placeholder="コメント..." value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '14px', color: '#000' }} />
                      <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 16px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>送信</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ボトムナビゲーション */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
          {[{ key: 'home', icon: '🏠', label: 'ホーム' }, { key: 'search', icon: '🔍', label: '検索' }, { key: 'messages', icon: '💬', label: 'メッセージ' }, { key: 'likes', icon: '❤️', label: 'いいね' }, { key: 'profile', icon: '👤', label: 'プロフ' }].map(({ key, icon, label }) => (
            <button key={key} onClick={() => key === 'messages' ? router.push('/messages') : key === 'profile' ? router.push('/profile') : setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '12px', color: tab === key ? '#e91e63' : '#999', opacity: tab === key ? 1 : 0.6 }}>
              <div style={{ fontSize: '20px' }}>{icon}</div>{label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 検索タブ
  if (tab === 'search') {
    const filteredUsers = Object.entries(allUsers)
      .filter(([id, u]: any) => id !== user?.uid && (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())))
      .map(([id, u]: any) => ({ id, ...u }));

    return (
      <div style={{ padding: '20px 16px', paddingBottom: '80px' }}>
        <input type="text" placeholder="ユーザーを検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '15px', color: '#000', marginBottom: '20px' }} />
        {filteredUsers.map((u: any) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e5e5' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#000', margin: 0 }}>{u.name}</p>
              <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{u.email}</p>
            </div>
            <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', backgroundColor: following.has(u.id) ? '#f0f0f0' : '#e91e63', color: following.has(u.id) ? '#000' : '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
              {following.has(u.id) ? 'フォロー中' : 'フォロー'}
            </button>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
