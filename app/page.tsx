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
  type: 'text' | 'question' | 'link' | 'poll' | 'story';
  timestamp: number;
  likes: number;
  comments: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'text' | 'question' | 'link' | 'poll' | 'story'>('text');
  const [users, setUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadData(currentUser.uid);
        setPage('home');
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
        setBio(profileSnapshot.val().bio || '');
      }

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
        bio: '',
        createdAt: new Date().toISOString(),
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
        type: postType,
        timestamp: Date.now(),
        likes: 0,
        comments: 0,
      });
      setNewPost('');
      setPostType('text');
      await loadData(user.uid);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await remove(ref(database, `posts/${postId}`));
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error:', error);
    }
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

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await update(ref(database, `users/${user.uid}`), { bio });
      setProfile({ ...profile, bio });
      setEditMode(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#000' }}>
        <div style={{ width: '100%' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', textAlign: 'center', marginBottom: '40px' }}>SafeSpace</h1>
          
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '16px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', backgroundColor: '#f5f5f5' }} />
          
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: '16px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', backgroundColor: '#f5f5f5' }} />
          
          <button onClick={authMode === 'login' ? handleLogin : handleSignup} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px' }}>
            {loading ? 'Loading...' : (authMode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
          
          <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setEmail(''); setPassword(''); }} style={{ width: '100%', padding: '16px', backgroundColor: '#f0f0f0', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            {authMode === 'login' ? 'Create New Account' : 'Back to Login'}
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (page === 'home') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '70px', color: '#000' }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>Home</h1>
          <button onClick={() => setPage('settings')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>⚙️</button>
        </div>

        {/* Post Creator */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
            {(['text', 'question', 'link', 'poll', 'story'] as const).map((type) => (
              <button key={type} onClick={() => setPostType(type)} style={{ flex: 1, padding: '10px', backgroundColor: postType === type ? '#e91e63' : '#f0f0f0', color: postType === type ? '#fff' : '#000', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {type === 'text' ? 'Text' : type === 'question' ? '?' : type === 'link' ? 'Link' : type === 'poll' ? 'Poll' : 'Story'}
              </button>
            ))}
          </div>

          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder={postType === 'question' ? 'Ask a question...' : postType === 'link' ? 'Share a link...' : postType === 'poll' ? 'Create a poll...' : 'What are you thinking?'} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '8px', padding: '16px', fontSize: '16px', fontFamily: 'inherit', resize: 'none', outline: 'none', backgroundColor: '#f9f9f9', color: '#000' }} rows={4} />

          <button onClick={handleCreatePost} disabled={!newPost.trim()} style={{ width: '100%', marginTop: '12px', padding: '16px', backgroundColor: newPost.trim() ? '#e91e63' : '#ddd', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '700', cursor: newPost.trim() ? 'pointer' : 'default' }}>
            Post
          </button>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.map((post) => (
            <div key={post.id} style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{post.userName}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>@{post.userId?.slice(0, 8)}</p>
                </div>
                {post.userId === user.uid && (
                  <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                )}
              </div>

              <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6 }}>{post.content}</p>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontSize: '16px' }}>
                <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>{likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>💬 {post.comments}</button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          <button onClick={() => setPage('home')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>🏠</button>
          <button onClick={() => setPage('explore')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>🔍</button>
          <button onClick={() => setPage('profile')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>👤</button>
        </div>
      </div>
    );
  }

  // EXPLORE PAGE
  if (page === 'explore') {
    const filteredUsers = users.filter(u => (u.email?.toLowerCase().includes(searchQuery.toLowerCase())));
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '70px', color: '#000' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." style={{ width: '100%', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', backgroundColor: '#f5f5f5' }} />
        </div>

        <div>
          {searchQuery && filteredUsers.map((u) => (
            <div key={u.id} style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{u.name}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>{u.bio || 'No bio'}</p>
              </div>
              <button onClick={() => handleFollow(u.id)} style={{ padding: '10px 20px', backgroundColor: following.has(u.id) ? '#f0f0f0' : '#e91e63', color: following.has(u.id) ? '#000' : '#fff', border: 'none', borderRadius: '20px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                {following.has(u.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          <button onClick={() => setPage('home')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>🏠</button>
          <button onClick={() => setPage('explore')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>🔍</button>
          <button onClick={() => setPage('profile')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>👤</button>
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (page === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '70px', color: '#000' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>Profile</h1>
          <button onClick={() => setEditMode(!editMode)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✏️</button>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e91e63', margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{user?.email?.split('@')[0]}</p>
            <p style={{ margin: '4px 0', fontSize: '16px', color: '#666' }}>{user?.email}</p>
          </div>

          {editMode ? (
            <div style={{ marginBottom: '24px', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', color: '#000' }} rows={3} />
              <button onClick={handleSaveProfile} style={{ width: '100%', marginTop: '12px', padding: '12px', backgroundColor: '#e91e63', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '24px', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '16px' }}>{bio || 'No bio yet'}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{posts.filter(p => p.userId === user?.uid).length}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Posts</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{following.size}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Following</p>
            </div>
          </div>

          <button onClick={async () => { await signOut(auth); setUser(null); setEmail(''); setPassword(''); }} style={{ width: '100%', padding: '16px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          <button onClick={() => setPage('home')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>🏠</button>
          <button onClick={() => setPage('explore')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>🔍</button>
          <button onClick={() => setPage('profile')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>👤</button>
        </div>
      </div>
    );
  }

  // SETTINGS PAGE
  if (page === 'settings') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '70px', color: '#000' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginBottom: '16px' }}>←</button>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>Settings</h1>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e5e5' }}>
            <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Privacy</p>
            <button style={{ width: '100%', padding: '12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>Private Account</button>
          </div>

          <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e5e5' }}>
            <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Notifications</p>
            <button style={{ width: '100%', padding: '12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>Push Notifications</button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>About</p>
            <p style={{ fontSize: '14px', color: '#666' }}>SafeSpace v1.0</p>
          </div>
        </div>
      </div>
    );
  }
}
