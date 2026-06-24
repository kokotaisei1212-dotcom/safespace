'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, get, push, set, remove, update } from 'firebase/database';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  likes: number;
  comments: any[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  followers: number;
  following: number;
}

const i18n = {
  en: {
    home: 'Home',
    search: 'Search',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    login: 'Log In',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    logout: 'Log Out',
    posts: 'Posts',
    following: 'Following',
    followers: 'Followers',
    follow: 'Follow',
    following_label: 'Following',
    post: 'Post',
    comment: 'Comment',
    reply: 'Reply',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    searchUsers: 'Search users...',
    searchPosts: 'Search posts...',
    whatsHappening: "What's on your mind?",
    addComment: 'Add a comment...',
    privacy: 'Privacy',
    blocked: 'Blocked Users',
    muted: 'Muted Users',
    notifications: 'Notifications',
    security: 'Security',
    blockUser: 'Block User',
    muteUser: 'Mute User',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    english: 'English',
    japanese: 'Japanese',
    noMessages: 'No messages',
    back: 'Back',
    bio: 'Bio',
    unblock: 'Unblock',
    unmute: 'Unmute',
  },
  ja: {
    home: 'ホーム',
    search: '検索',
    messages: 'メッセージ',
    profile: 'プロフィール',
    settings: '設定',
    login: 'ログイン',
    signup: 'サインアップ',
    email: 'メールアドレス',
    password: 'パスワード',
    logout: 'ログアウト',
    posts: '投稿',
    following: 'フォロー中',
    followers: 'フォロワー',
    follow: 'フォロー',
    following_label: 'フォロー中',
    post: '投稿',
    comment: 'コメント',
    reply: '返信',
    delete: '削除',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    searchUsers: 'ユーザーを検索...',
    searchPosts: '投稿を検索...',
    whatsHappening: '何か思いついた?',
    addComment: 'コメントを追加...',
    privacy: 'プライバシー',
    blocked: 'ブロックユーザー',
    muted: 'ミュートユーザー',
    notifications: '通知',
    security: 'セキュリティ',
    blockUser: 'ユーザーをブロック',
    muteUser: 'ユーザーをミュート',
    theme: 'テーマ',
    language: '言語',
    dark: 'ダーク',
    light: 'ライト',
    english: 'English',
    japanese: '日本語',
    noMessages: 'メッセージなし',
    back: '戻る',
    bio: '自己紹介',
    unblock: 'ブロック解除',
    unmute: 'ミュート解除',
  },
};

type Lang = 'en' | 'ja';
type Theme = 'dark' | 'light';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState(new Set<string>());
  const [blocked, setBlocked] = useState(new Set<string>());
  const [muted, setMuted] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'users' | 'posts'>('users');
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('ja');
  const [theme, setTheme] = useState<Theme>('dark');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editBio, setEditBio] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [selectedChat, setSelectedChat] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const t = i18n[lang];

  const colors = {
    dark: { bg: '#000', text: '#fff', border: '#222', input: '#1a1a1a', button: '#222', accent: '#ff6b6b' },
    light: { bg: '#fff', text: '#000', border: '#e5e5e5', input: '#f5f5f5', button: '#f0f0f0', accent: '#e91e63' },
  };

  const c = colors[theme];

  useEffect(() => {
    const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
    setLang(browserLang as Lang);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (uid: string) => {
    try {
      const profileRef = ref(database, `users/${uid}`);
      const profileSnapshot = await get(profileRef);
      if (profileSnapshot.exists()) {
        const profileData = profileSnapshot.val();
        setProfile(profileData);
        setEditBio(profileData.bio || '');
      }

      const postsRef = ref(database, 'posts');
      const postsSnapshot = await get(postsRef);
      if (postsSnapshot.exists()) {
        const postsData = Object.entries(postsSnapshot.val()).map(([id, data]: any) => ({
          id,
          ...data,
          comments: data.comments || [],
        }));
        setPosts(postsData.sort((a, b) => b.timestamp - a.timestamp));
      }

      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      if (usersSnapshot.exists()) {
        const usersData = Object.entries(usersSnapshot.val())
          .filter(([id]) => id !== uid)
          .map(([id, data]: any) => ({ id, ...data, followers: 0, following: 0 }));
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(database, `users/${userCred.user.uid}`), {
        id: userCred.user.uid,
        email,
        name: email.split('@')[0],
        bio: '',
        followers: 0,
        following: 0,
      });
      setUser(userCred.user);
    } catch (error) {
      alert('Signup failed');
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;
    try {
      const postsRef = ref(database, 'posts');
      await push(postsRef, {
        userId: user.uid,
        userName: profile?.name || 'User',
        content: newPost,
        timestamp: Date.now(),
        likes: 0,
        comments: [],
      });
      setNewPost('');
      await loadData(user.uid);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete?')) return;
    try {
      await remove(ref(database, `posts/${postId}`));
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const updatedComments = [...post.comments, { userId: user.uid, userName: profile?.name || 'User', text: newComment, timestamp: Date.now() }];
    await update(ref(database, `posts/${postId}`), { comments: updatedComments });
    
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    setNewComment('');
  };

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handleFollow = (userId: string) => {
    const newFollowing = new Set(following);
    if (newFollowing.has(userId)) {
      newFollowing.delete(userId);
    } else {
      newFollowing.add(userId);
    }
    setFollowing(newFollowing);
  };

  const handleBlock = (userId: string) => {
    const newBlocked = new Set(blocked);
    if (newBlocked.has(userId)) {
      newBlocked.delete(userId);
    } else {
      newBlocked.add(userId);
    }
    setBlocked(newBlocked);
  };

  const handleMute = (userId: string) => {
    const newMuted = new Set(muted);
    if (newMuted.has(userId)) {
      newMuted.delete(userId);
    } else {
      newMuted.add(userId);
    }
    setMuted(newMuted);
  };

  const handleSaveBio = async () => {
    if (!user) return;
    try {
      await update(ref(database, `users/${user.uid}`), { bio: editBio });
      setProfile({ ...profile!, bio: editBio });
      setEditMode(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', margin: '0 0 40px 0' }}>SafeSpace</h1>

          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} style={{ width: '100%', padding: '12px', marginBottom: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} style={{ width: '100%', padding: '12px', marginBottom: '20px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} />

          <button onClick={authMode === 'login' ? handleLogin : handleSignup} disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}>
            {loading ? 'Loading...' : (authMode === 'login' ? t.login : t.signup)}
          </button>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ width: '100%', padding: '12px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            {authMode === 'login' ? t.signup : t.login}
          </button>
        </div>
      </div>
    );
  }

  if (tab === 'home') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
        </div>

        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', flexShrink: 0 }} />
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={t.whatsHappening} style={{ flex: 1, padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none' }} rows={3} />
          </div>
          <button onClick={handleCreatePost} disabled={!newPost.trim()} style={{ marginLeft: 'auto', display: 'block', padding: '8px 24px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: newPost.trim() ? 1 : 0.5 }}>
            {t.post}
          </button>
        </div>

        <div>
          {posts.map((post) => (
            <div key={post.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{post.userName}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                    {post.userId === user.uid && (
                      <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '14px' }}>x</button>
                    )}
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: 1.5 }}>{post.content}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                    <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', color: likedPosts.has(post.id) ? c.accent : '#999', cursor: 'pointer', fontSize: '12px' }}>
                      Like {post.likes}
                    </button>
                    <span>Comment {post.comments.length}</span>
                  </div>

                  {expandedPost === post.id && (
                    <div style={{ backgroundColor: c.input, padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '12px' }}>
                        {post.comments.map((comment: any, idx: number) => (
                          <div key={idx} style={{ marginBottom: '8px', fontSize: '12px', borderBottom: `1px solid ${c.border}`, paddingBottom: '8px' }}>
                            <p style={{ margin: 0, fontWeight: '600' }}>{comment.userName}</p>
                            <p style={{ margin: '2px 0 0 0', color: '#999' }}>{comment.text}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t.addComment} style={{ flex: 1, padding: '8px', backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }} />
                        <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 12px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Send</button>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)} style={{ background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: '12px', marginTop: '8px' }}>
                    {expandedPost === post.id ? 'Hide' : 'Show'} comments
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Search' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }, { key: 'settings', label: 'Settings' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? c.accent : '#999', fontWeight: tab === key ? '600' : '400' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'search') {
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !blocked.has(u.id));
    const filteredPosts = posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) && !blocked.has(p.userId));

    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button onClick={() => setSearchMode('users')} style={{ flex: 1, padding: '8px', backgroundColor: searchMode === 'users' ? c.accent : c.button, color: searchMode === 'users' ? '#fff' : c.text, border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Users</button>
            <button onClick={() => setSearchMode('posts')} style={{ flex: 1, padding: '8px', backgroundColor: searchMode === 'posts' ? c.accent : c.button, color: searchMode === 'posts' ? '#fff' : c.text, border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Posts</button>
          </div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={searchMode === 'users' ? t.searchUsers : t.searchPosts} style={{ width: '100%', padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', outline: 'none' }} />
        </div>

        {searchMode === 'users' ? (
          <div>
            {filteredUsers.map((u) => (
              <div key={u.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, cursor: 'pointer' }} onClick={() => setViewingUser(u)}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{u.name}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{u.bio}</p>
                  </div>
                </div>
                <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', backgroundColor: following.has(u.id) ? c.button : c.accent, color: following.has(u.id) ? c.text : '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {following.has(u.id) ? t.following_label : t.follow}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filteredPosts.map((p) => (
              <div key={p.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{p.userName}</p>
                <p style={{ margin: 0, fontSize: '14px', marginBottom: '8px' }}>{p.content}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Like {p.likes}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Search' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }, { key: 'settings', label: 'Settings' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? c.accent : '#999', fontWeight: tab === key ? '600' : '400' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'messages') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{t.messages}</h1>
        </div>

        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ width: '120px', borderRight: `1px solid ${c.border}`, overflowY: 'auto', backgroundColor: c.input }}>
            {users.map((u) => (
              <button key={u.id} onClick={() => setSelectedChat(u)} style={{ width: '100%', padding: '12px', border: 'none', backgroundColor: selectedChat?.id === u.id ? c.accent : 'transparent', color: selectedChat?.id === u.id ? '#fff' : c.text, cursor: 'pointer', fontSize: '12px', textAlign: 'left', fontWeight: selectedChat?.id === u.id ? '600' : '400' }}>
                {u.name}
              </button>
            ))}
          </div>

          {selectedChat ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, fontWeight: '600', fontSize: '14px' }}>
                {selectedChat.name}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} />
              <div style={{ padding: '12px', borderTop: `1px solid ${c.border}`, display: 'flex', gap: '8px' }}>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t.addComment} style={{ flex: 1, padding: '8px 12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', outline: 'none' }} />
                <button style={{ padding: '8px 16px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>Send</button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              {t.noMessages}
            </div>
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Search' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }, { key: 'settings', label: 'Settings' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? c.accent : '#999', fontWeight: tab === key ? '600' : '400' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'profile') {
    const displayProfile = viewingUser || profile;
    const isOwnProfile = !viewingUser || viewingUser.id === user?.uid;

    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        {viewingUser && (
          <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            <button onClick={() => setViewingUser(null)} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '16px', marginBottom: '16px' }}>← Back</button>
          </div>
        )}

        <div style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{displayProfile?.name}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{displayProfile?.email}</p>
        </div>

        {isOwnProfile && editMode ? (
          <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', marginBottom: '12px' }} rows={3} />
            <button onClick={handleSaveBio} style={{ marginRight: '8px', padding: '8px 16px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
              {t.save}
            </button>
            <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
              {t.cancel}
            </button>
          </div>
        ) : (
          <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ margin: 0, fontSize: '14px' }}>{displayProfile?.bio || 'No bio'}</p>
            {isOwnProfile && (
              <button onClick={() => setEditMode(true)} style={{ marginTop: '8px', background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: '12px' }}>
                {t.edit}
              </button>
            )}
          </div>
        )}

        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-around', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{posts.filter(p => p.userId === displayProfile?.id).length}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.posts}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{following.size}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.following}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>0</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.followers}</p>
          </div>
        </div>

        {!isOwnProfile && (
          <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={() => handleFollow(viewingUser!.id)} style={{ flex: 1, padding: '12px', backgroundColor: following.has(viewingUser!.id) ? c.button : c.accent, color: following.has(viewingUser!.id) ? c.text : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {following.has(viewingUser!.id) ? t.following_label : t.follow}
            </button>
            <button onClick={() => handleBlock(viewingUser!.id)} style={{ padding: '12px 16px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              {blocked.has(viewingUser!.id) ? 'Unblock' : 'Block'}
            </button>
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Search' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }, { key: 'settings', label: 'Settings' }].map(({ key, label }) => (
            <button key={key} onClick={() => { setTab(key); setViewingUser(null); }} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? c.accent : '#999', fontWeight: tab === key ? '600' : '400' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'settings') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{t.settings}</h1>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>{t.theme}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['dark', 'light'] as const).map((th) => (
                <button key={th} onClick={() => setTheme(th)} style={{ flex: 1, padding: '10px', backgroundColor: theme === th ? c.accent : c.button, color: theme === th ? '#fff' : c.text, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {th === 'dark' ? t.dark : t.light}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>{t.language}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['ja', 'en'] as const).map((la) => (
                <button key={la} onClick={() => setLang(la)} style={{ flex: 1, padding: '10px', backgroundColor: lang === la ? c.accent : c.button, color: lang === la ? '#fff' : c.text, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  {la === 'ja' ? t.japanese : t.english}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>{t.privacy}</p>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Account is public</p>
          </div>

          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>{t.blocked}</p>
            <div>
              {Array.from(blocked).map((userId) => {
                const blockedUser = users.find(u => u.id === userId);
                return blockedUser ? (
                  <div key={userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                    <p style={{ margin: 0 }}>{blockedUser.name}</p>
                    <button onClick={() => handleBlock(userId)} style={{ background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: '12px' }}>Unblock</button>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>{t.muted}</p>
            <div>
              {Array.from(muted).map((userId) => {
                const mutedUser = users.find(u => u.id === userId);
                return mutedUser ? (
                  <div key={userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px' }}>
                    <p style={{ margin: 0 }}>{mutedUser.name}</p>
                    <button onClick={() => handleMute(userId)} style={{ background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: '12px' }}>Unmute</button>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <button onClick={async () => { await signOut(auth); setUser(null); }} style={{ width: '100%', padding: '12px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            {t.logout}
          </button>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Search' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }, { key: 'settings', label: 'Settings' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? c.accent : '#999', fontWeight: tab === key ? '600' : '400' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
