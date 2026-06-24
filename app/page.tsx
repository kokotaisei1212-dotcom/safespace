'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, get, push, set, remove, update } from 'firebase/database';

type TabType = 'home' | 'search' | 'profile' | 'settings';

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
  username: string;
  email: string;
  bio: string;
  website: string;
  privateAccount: boolean;
}

const i18n = {
  en: {
    home: 'Home', search: 'Search', profile: 'Profile', settings: 'Settings', login: 'Log In', signup: 'Sign Up',
    email: 'Email', password: 'Password', logout: 'Log Out', posts: 'Posts', following: 'Following',
    followers: 'Followers', follow: 'Follow', following_label: 'Following', post: 'Post', comment: 'Comment',
    delete: 'Delete', edit: 'Edit', save: 'Save', cancel: 'Cancel', searchUsers: 'Search users...',
    searchPosts: 'Search posts...', whatsHappening: "What's on your mind?", addComment: 'Add a comment...',
    name: 'Name', username: 'Username', bio: 'Bio', website: 'Website', privateAccount: 'Private Account',
    theme: 'Theme', language: 'Language', dark: 'Dark', light: 'Light', english: 'English', japanese: 'Japanese',
    back: 'Back', edit_profile: 'Edit Profile', account_settings: 'Account Settings',
    privacy_security: 'Privacy & Security', notifications: 'Notifications', blocked_users: 'Blocked Users',
    data_download: 'Download Your Data', deactivate: 'Deactivate Account', block: 'Block', unblock: 'Unblock',
  },
  ja: {
    home: 'ホーム', search: '検索', profile: 'プロフィール', settings: '設定', login: 'ログイン', signup: 'サインアップ',
    email: 'メールアドレス', password: 'パスワード', logout: 'ログアウト', posts: '投稿', following: 'フォロー中',
    followers: 'フォロワー', follow: 'フォロー', following_label: 'フォロー中', post: '投稿', comment: 'コメント',
    delete: '削除', edit: '編集', save: '保存', cancel: 'キャンセル', searchUsers: 'ユーザーを検索...',
    searchPosts: '投稿を検索...', whatsHappening: '何か思いついた?', addComment: 'コメントを追加...',
    name: '名前', username: 'ユーザー名', bio: '自己紹介', website: 'ウェブサイト', privateAccount: '非公開アカウント',
    theme: 'テーマ', language: '言語', dark: 'ダーク', light: 'ライト', english: 'English', japanese: '日本語',
    back: '戻る', edit_profile: 'プロフィール編集', account_settings: 'アカウント設定',
    privacy_security: 'プライバシーとセキュリティ', notifications: '通知', blocked_users: 'ブロック中のユーザー',
    data_download: 'データをダウンロード', deactivate: 'アカウントを無効化', block: 'ブロック', unblock: 'ブロック解除',
  },
} as const;

type Lang = 'en' | 'ja';
type Theme = 'dark' | 'light';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabType>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('ja');
  const [theme, setTheme] = useState<Theme>('dark');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

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
        setProfile(profileSnapshot.val());
        setEditData(profileSnapshot.val());
      }
      const postsRef = ref(database, 'posts');
      const postsSnapshot = await get(postsRef);
      if (postsSnapshot.exists()) {
        const postsData = Object.entries(postsSnapshot.val()).map(([id, data]: any) => ({
          id, ...data, comments: data.comments || [],
        }));
        setPosts(postsData.sort((a, b) => b.timestamp - a.timestamp));
      }
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      if (usersSnapshot.exists()) {
        const usersData = Object.entries(usersSnapshot.val()).filter(([id]) => id !== uid).map(([id, data]: any) => ({ id, ...data }));
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
        id: userCred.user.uid, email, name: email.split('@')[0], username: email.split('@')[0],
        bio: '', website: '', privateAccount: false,
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
        userId: user.uid, userName: profile?.name || 'User', content: newPost,
        timestamp: Date.now(), likes: 0, comments: [],
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

  const handleLike = (postId: string) => {
    setLikedPosts(likedPosts.includes(postId) ? likedPosts.filter(id => id !== postId) : [...likedPosts, postId]);
  };

  const handleFollow = (userId: string) => {
    setFollowing(following.includes(userId) ? following.filter(id => id !== userId) : [...following, userId]);
  };

  const handleBlock = (userId: string) => {
    setBlocked(blocked.includes(userId) ? blocked.filter(id => id !== userId) : [...blocked, userId]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await update(ref(database, `users/${user.uid}`), editData);
      setProfile(editData);
      setEditMode(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderNav = () => (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
      <button onClick={() => setTab('home')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: c.text, opacity: tab === 'home' ? 1 : 0.5 }}>H</button>
      <button onClick={() => setTab('search')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: c.text, opacity: tab === 'search' ? 1 : 0.5 }}>S</button>
      <button onClick={() => setTab('profile')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: c.text, opacity: tab === 'profile' ? 1 : 0.5 }}>P</button>
      <button onClick={() => setTab('settings')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: c.text, opacity: tab === 'settings' ? 1 : 0.5 }}>G</button>
    </div>
  );

  if (!user) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', margin: '0 0 40px 0' }}>SafeSpace</h1>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.email} style={{ width: '100%', padding: '12px', marginBottom: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password} style={{ width: '100%', padding: '12px', marginBottom: '20px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          <button onClick={authMode === 'login' ? handleLogin : handleSignup} disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', boxSizing: 'border-box' }}>{loading ? 'Loading...' : (authMode === 'login' ? t.login : t.signup)}</button>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ width: '100%', padding: '12px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', boxSizing: 'border-box' }}>{authMode === 'login' ? t.signup : t.login}</button>
        </div>
      </div>
    );
  }

  if (tab === 'home') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0, background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
        </div>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', flexShrink: 0 }} />
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={t.whatsHappening} style={{ flex: 1, padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }} rows={3} />
          </div>
          <button onClick={handleCreatePost} style={{ marginLeft: 'auto', display: 'block', padding: '8px 24px', backgroundColor: c.accent, color: '#fff', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', opacity: newPost.trim() ? 1 : 0.5 }}>{t.post}</button>
        </div>
        <div>{posts.map((post) => (
          <div key={post.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{post.userName}</p><p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{new Date(post.timestamp).toLocaleDateString()}</p></div>
                  {post.userId === user.uid && <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '14px' }}>x</button>}
                </div>
                <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: 1.5 }}>{post.content}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', color: likedPosts.includes(post.id) ? c.accent : '#999', cursor: 'pointer', fontSize: '12px' }}>Like {post.likes}</button>
                  <span>Comment {post.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}</div>
        {renderNav()}
      </div>
    );
  }

  if (tab === 'search') {
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !blocked.includes(u.id));
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchUsers} style={{ width: '100%', padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>{filteredUsers.map((u) => (
          <div key={u.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, cursor: 'pointer' }} onClick={() => setViewingUser(u)}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)' }} />
              <div><p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{u.name}</p><p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{u.bio}</p></div>
            </div>
            <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', backgroundColor: following.includes(u.id) ? c.button : c.accent, color: following.includes(u.id) ? c.text : '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{following.includes(u.id) ? t.following_label : t.follow}</button>
          </div>
        ))}</div>
        {renderNav()}
      </div>
    );
  }

  if (tab === 'profile') {
    const displayProfile = viewingUser || profile;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{displayProfile?.name}</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#999' }}>@{displayProfile?.username}</p>
        </div>
        <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
          <p style={{ margin: 0, fontSize: '14px' }}>{displayProfile?.bio || 'No bio'}</p>
          {!viewingUser && <button onClick={() => setEditMode('profile')} style={{ marginTop: '8px', background: 'none', border: 'none', color: c.accent, cursor: 'pointer', fontSize: '12px' }}>{t.edit_profile}</button>}
        </div>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-around', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{posts.filter(p => p.userId === displayProfile?.id).length}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.posts}</p></div>
          <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{following.length}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{t.following}</p></div>
        </div>
        {viewingUser && (
          <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={() => handleFollow(viewingUser.id)} style={{ flex: 1, padding: '12px', backgroundColor: following.includes(viewingUser.id) ? c.button : c.accent, color: following.includes(viewingUser.id) ? c.text : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{following.includes(viewingUser.id) ? t.following_label : t.follow}</button>
          </div>
        )}
        {renderNav()}
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
          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' }}>{t.theme}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['dark', 'light'] as const).map((th) => (<button key={th} onClick={() => setTheme(th)} style={{ flex: 1, padding: '8px', backgroundColor: theme === th ? c.accent : c.button, color: theme === th ? '#fff' : c.text, border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>{th === 'dark' ? t.dark : t.light}</button>))}
            </div>
          </div>
          <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' }}>{t.language}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['ja', 'en'] as const).map((la) => (<button key={la} onClick={() => setLang(la)} style={{ flex: 1, padding: '8px', backgroundColor: lang === la ? c.accent : c.button, color: lang === la ? '#fff' : c.text, border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>{la === 'ja' ? t.japanese : t.english}</button>))}
            </div>
          </div>
          <button onClick={async () => { await signOut(auth); setUser(null); }} style={{ width: '100%', padding: '12px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{t.logout}</button>
        </div>
        {renderNav()}
      </div>
    );
  }

  return null;
}
