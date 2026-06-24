'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, get, push, set, remove } from 'firebase/database';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  likes: number;
}

const i18n = {
  en: {
    home: 'Home',
    search: 'Search',
    messages: 'Messages',
    profile: 'Profile',
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
    searchUsers: 'Search',
    whatsHappening: "What's on your mind?",
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    english: 'English',
    japanese: '日本語',
  },
  ja: {
    home: 'ホーム',
    search: '検索',
    messages: 'メッセージ',
    profile: 'プロフィール',
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
    searchUsers: '検索',
    whatsHappening: '何か思いついた?',
    settings: '設定',
    theme: 'テーマ',
    language: '言語',
    dark: 'ダーク',
    light: 'ライト',
    english: 'English',
    japanese: '日本語',
  },
};

type Lang = 'en' | 'ja';
type Theme = 'dark' | 'light';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('ja');
  const [theme, setTheme] = useState<Theme>('dark');

  const t = i18n[lang];

  const colors = {
    dark: {
      bg: '#000',
      text: '#fff',
      border: '#222',
      input: '#1a1a1a',
      button: '#222',
      accent: '#ff6b6b',
    },
    light: {
      bg: '#fff',
      text: '#000',
      border: '#e5e5e5',
      input: '#f5f5f5',
      button: '#f0f0f0',
      accent: '#e91e63',
    },
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
      const postsRef = ref(database, 'posts');
      const postsSnapshot = await get(postsRef);
      if (postsSnapshot.exists()) {
        const postsData = Object.entries(postsSnapshot.val()).map(([id, data]: any) => ({
          id,
          ...data,
        }));
        setPosts(postsData.sort((a, b) => b.timestamp - a.timestamp));
      }

      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      if (usersSnapshot.exists()) {
        const usersData = Object.entries(usersSnapshot.val())
          .filter(([id]) => id !== uid)
          .map(([id, data]: any) => ({ id, ...data }));
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
        userName: user.email?.split('@')[0] || 'User',
        content: newPost,
        timestamp: Date.now(),
        likes: 0,
      });
      setNewPost('');
      await loadData(user.uid);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await remove(ref(database, `posts/${postId}`));
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error:', error);
    }
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

  // LOGIN
  if (!user) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', marginBottom: '40px', margin: 0, marginBottom: '40px' }}>SafeSpace</h1>

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

  // HOME
  if (tab === 'home') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
          <button onClick={() => setTab('settings')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: c.text }}>⚙</button>
        </div>

        {/* Post Creator */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', flexShrink: 0 }} />
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={t.whatsHappening} style={{ flex: 1, padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none' }} rows={3} />
          </div>
          <button onClick={handleCreatePost} disabled={!newPost.trim()} style={{ marginLeft: 'auto', display: 'block', padding: '8px 24px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: newPost.trim() ? 1 : 0.5 }}>
            {t.post}
          </button>
        </div>

        {/* Posts */}
        <div>
          {posts.map((post) => (
            <div key={post.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{post.userName}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{new Date(post.timestamp).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}</p>
                  </div>
                  {post.userId === user.uid && (
                    <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '14px' }}>x</button>
                  )}
                </div>
                <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: 1.5 }}>{post.content}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999' }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', color: likedPosts.has(post.id) ? c.accent : '#999', cursor: 'pointer', fontSize: '12px' }}>
                    {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <span>💬 0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: tab === key ? 1 : 0.5 }}>
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // SEARCH
  if (tab === 'search') {
    const filtered = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchUsers} style={{ width: '100%', padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', outline: 'none' }} />
        </div>

        <div>
          {filtered.map((u) => (
            <div key={u.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{u.name}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{u.email}</p>
                </div>
              </div>
              <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', backgroundColor: following.has(u.id) ? c.button : c.accent, color: following.has(u.id) ? c.text : '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {following.has(u.id) ? t.following_label : t.follow}
              </button>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: tab === key ? 1 : 0.5 }}>
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // PROFILE
  if (tab === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{user?.email?.split('@')[0]}</p>
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>{user?.email}</p>
        </div>

        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-around', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{posts.filter(p => p.userId === user?.uid).length}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.posts}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{following.size}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.following}</p>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          <button onClick={async () => { await signOut(auth); setUser(null); }} style={{ width: '100%', padding: '12px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
            {t.logout}
          </button>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', icon: '🏠' }, { key: 'search', icon: '🔍' }, { key: 'messages', icon: '💬' }, { key: 'profile', icon: '👤' }].map(({ key, icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', opacity: tab === key ? 1 : 0.5 }}>
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // SETTINGS
  if (tab === 'settings') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '16px', marginBottom: '16px' }}>← Back</button>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>{t.settings}</h1>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{t.theme}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['dark', 'light'] as const).map((t_) => (
                <button key={t_} onClick={() => setTheme(t_)} style={{ flex: 1, padding: '12px', backgroundColor: theme === t_ ? c.accent : c.button, color: theme === t_ ? '#fff' : c.text, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {t_ === 'dark' ? t.dark : t.light}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>{t.language}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['ja', 'en'] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: '12px', backgroundColor: lang === l ? c.accent : c.button, color: lang === l ? '#fff' : c.text, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {l === 'ja' ? t.japanese : t.english}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
