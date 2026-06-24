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

interface UserProfile {
  name: string;
  bio: string;
  identityVerified: boolean;
}

export default function App() {
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
  const [profile, setProfile] = useState<UserProfile>({ name: '', bio: '', identityVerified: false });
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    // プロフィール取得
    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          identityVerified: data.identityVerified || false,
        });
        setFollowing(new Set(Object.keys(data.following || {})));
        setStats({
          posts: Object.keys(data.posts || {}).length,
          followers: Object.keys(data.followers || {}).length,
          following: Object.keys(data.following || {}).length,
        });
      }
    });

    // 投稿リアルタイム
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

    // ユーザー一覧
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

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);

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

  const conversations = [
    { id: '1', name: 'ユーザーA', lastMessage: 'おはよう！', time: '5分前' },
    { id: '2', name: 'ユーザーB', lastMessage: 'ありがとう', time: '1時間前' },
    { id: '3', name: 'ユーザーC', lastMessage: 'また明日！', time: '3時間前' },
  ];

  // ホームタブ
  if (tab === 'home') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
        <div style={{ borderBottom: '1px solid #262626', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#262626', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>ログアウト</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
          <div style={{ borderBottom: '1px solid #262626', padding: '16px' }}>
            <form onSubmit={handlePost} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <textarea placeholder="何か思いついた？" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #262626', fontSize: '15px', color: '#fff', minHeight: '40px', fontFamily: 'inherit', backgroundColor: '#262626', borderRadius: '20px', resize: 'vertical' }} />
                {error && <div style={{ color: '#f91880', fontSize: '12px', marginTop: '8px' }}>{error}</div>}
                <button type="submit" disabled={loading || !content.trim()} style={{ marginTop: '12px', padding: '8px 24px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', opacity: loading || !content.trim() ? 0.5 : 1 }}>
                  {loading ? '投稿中...' : '投稿'}
                </button>
              </div>
            </form>
          </div>

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ fontSize: '15px', margin: 0 }}>投稿がまだありません</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} style={{ borderBottom: '1px solid #262626', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{post.userName}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>
                  {post.userId !== user?.uid && (
                    <button onClick={() => handleFollow(post.userId)} style={{ padding: '6px 12px', background: following.has(post.userId) ? 'transparent' : 'linear-gradient(45deg, #f09433, #e6683c)', color: following.has(post.userId) ? '#999' : '#fff', border: following.has(post.userId) ? '1px solid #262626' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      {following.has(post.userId) ? 'フォロー中' : 'フォロー'}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '15px', color: '#fff', margin: '12px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</p>

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', color: '#999', paddingTop: '12px', borderTop: '1px solid #262626' }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: likedPosts.has(post.id) ? '#f91880' : '#999', padding: 0 }}>
                    {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button onClick={() => setExpandedComments(new Set(expandedComments).add(post.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#999', padding: 0 }}>
                    💬 {Object.keys(post.comments || {}).length}
                  </button>
                </div>

                {expandedComments.has(post.id) && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #262626' }}>
                    {Object.values(post.comments || {}).map((comment: any) => (
                      <div key={comment.id} style={{ marginBottom: '12px', fontSize: '14px' }}>
                        <strong style={{ color: '#fff' }}>{comment.userName}</strong>
                        <p style={{ color: '#ccc', margin: '4px 0' }}>{comment.content}</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input type="text" placeholder="コメントを追加..." value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} style={{ flex: 1, padding: '8px 12px', border: '1px solid #262626', borderRadius: '20px', fontSize: '14px', color: '#fff', backgroundColor: '#262626' }} />
                      <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 16px', background: 'linear-gradient(45deg, #f09433, #e6683c)', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>送信</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #262626', backgroundColor: '#000', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '20px', opacity: tab === key ? 1 : 0.6 }}>{icon}</button>
          ))}
        </div>
      </div>
    );
  }

  // 検索タブ
  if (tab === 'search') {
    const filteredUsers = Object.entries(allUsers).filter(([id, u]: any) => id !== user?.uid && (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))).map(([id, u]: any) => ({ id, ...u }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '60px' }}>
        <div style={{ borderBottom: '1px solid #262626', padding: '16px' }}>
          <input type="text" placeholder="ユーザーを検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #262626', borderRadius: '20px', fontSize: '15px', color: '#fff', backgroundColor: '#262626' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredUsers.map((u: any) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #262626' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>{u.name}</p>
                <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>{u.email}</p>
              </div>
              <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', background: following.has(u.id) ? 'transparent' : 'linear-gradient(45deg, #f09433, #e6683c)', color: following.has(u.id) ? '#999' : '#fff', border: following.has(u.id) ? '1px solid #262626' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                {following.has(u.id) ? 'フォロー中' : 'フォロー'}
              </button>
            </div>
          ))}
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #262626', backgroundColor: '#000', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '20px', opacity: tab === key ? 1 : 0.6 }}>{icon}</button>
          ))}
        </div>
      </div>
    );
  }

  // メッセージタブ
  if (tab === 'messages') {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
        <div style={{ width: '320px', borderRight: '1px solid #262626', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #262626' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>メッセージ</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => setSelectedUser(conv.id)} style={{ padding: '12px 16px', borderBottom: '1px solid #262626', cursor: 'pointer', backgroundColor: selectedUser === conv.id ? '#262626' : '#000' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>{conv.name}</p>
                <p style={{ fontSize: '13px', color: '#999', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage}</p>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{conv.time}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedUser ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #262626', padding: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{conversations.find(c => c.id === selectedUser)?.name}</h3>
            </div>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center', color: '#999' }}>メッセージがありません</div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #262626', display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="メッセージを入力..." value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ flex: 1, padding: '10px 14px', border: '1px solid #262626', borderRadius: '20px', fontSize: '14px', color: '#fff', backgroundColor: '#262626' }} />
              <button style={{ padding: '10px 20px', background: 'linear-gradient(45deg, #f09433, #e6683c)', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>送信</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>メッセージを選択してください</div>
        )}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #262626', backgroundColor: '#000', display: 'flex', justifyContent: 'space-around', padding: '12px 0', width: '100%' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '20px', opacity: tab === key ? 1 : 0.6 }}>{icon}</button>
          ))}
        </div>
      </div>
    );
  }

  // プロフィールタブ
  if (tab === 'profile') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', color: '#fff', paddingBottom: '60px' }}>
        <div style={{ borderBottom: '1px solid #262626', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>プロフィール</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#262626', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>ログアウト</button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743)', height: '150px' }} />

        <div style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743)', border: '3px solid #000' }} />
            <button onClick={() => setEditing(!editing)} style={{ padding: '10px 20px', backgroundColor: '#262626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              {editing ? 'キャンセル' : '編集'}
            </button>
          </div>

          <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {profile.name || user?.email}
            {profile.identityVerified && '✅'}
          </p>
          <p style={{ fontSize: '13px', color: '#999', margin: '0 0 16px 0' }}>{user?.email}</p>

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

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input type="text" placeholder="名前" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ padding: '12px', border: '1px solid #262626', borderRadius: '8px', fontSize: '14px', color: '#fff', backgroundColor: '#262626' }} />
              <textarea placeholder="自己紹介" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} style={{ padding: '12px', border: '1px solid #262626', borderRadius: '8px', fontSize: '14px', color: '#fff', backgroundColor: '#262626', minHeight: '80px', fontFamily: 'inherit' }} />
              <button onClick={handleSaveProfile} disabled={loading} style={{ padding: '10px 20px', background: 'linear-gradient(45deg, #f09433, #e6683c)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '20px' }}>{profile.bio || '自己紹介がまだ設定されていません'}</p>
          )}

          {profile.identityVerified ? (
            <div style={{ backgroundColor: '#1a3a1a', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '13px', color: '#4caf50', margin: 0 }}>✅ 本人確認済み</p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#3a2a1a', borderRadius: '8px', padding: '12px' }}>
              <p style={{ fontSize: '13px', color: '#ff9800', margin: 0 }}>⚠️ 本人確認が必要です</p>
            </div>
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #262626', backgroundColor: '#000', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '20px', opacity: tab === key ? 1 : 0.6 }}>{icon}</button>
          ))}
        </div>
      </div>
    );
  }
}
