'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, get, push } from 'firebase/database';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  likes: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadData(currentUser.uid);
      } else {
        router.push('/join');
      }
    });
    return () => unsubscribe();
  }, [router]);

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
      console.error('Error loading data:', error);
    }
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

  if (!user) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff' }}>Loading...</div>;
  }

  // HOME TAB
  if (tab === 'home') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: '#000' }}>Home</h1>
        </div>
        
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's happening?!" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '12px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', backgroundColor: '#f9f9f9', color: '#000' }} rows={3} />
          <button onClick={handleCreatePost} disabled={!newPost.trim()} style={{ marginTop: '12px', padding: '10px 24px', backgroundColor: newPost.trim() ? '#e91e63' : '#ddd', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: newPost.trim() ? 'pointer' : 'default' }}>Post</button>
        </div>

        <div>
          {posts.map((post) => (
            <div key={post.id} style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '14px', color: '#000' }}>{post.userName}</p>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#999' }}>@{post.userId?.slice(0, 8)}</p>
              <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: 1.5, color: '#000' }}>{post.content}</p>
              <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: likedPosts.has(post.id) ? '#e91e63' : '#999', padding: 0, fontSize: '12px' }}>
                {likedPosts.has(post.id) ? '♥' : '♡'} {post.likes}
              </button>
            </div>
          ))}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400', borderTop: tab === key ? '3px solid #000' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // EXPLORE TAB
  if (tab === 'search') {
    const filteredUsers = users.filter(u => (u.email?.toLowerCase().includes(searchQuery.toLowerCase())) || (u.name?.toLowerCase().includes(searchQuery.toLowerCase())));
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: '20px', fontSize: '14px', outline: 'none', backgroundColor: '#f9f9f9', color: '#000' }} />
        </div>
        <div>
          {searchQuery && filteredUsers.map((u) => (
            <div key={u.id} style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#000' }}>{u.name || u.email?.split('@')[0]}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{u.email}</p></div>
              <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', backgroundColor: following.has(u.id) ? '#fff' : '#e91e63', color: following.has(u.id) ? '#000' : '#fff', border: following.has(u.id) ? '1px solid #e5e5e5' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                {following.has(u.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400', borderTop: tab === key ? '3px solid #000' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // MESSAGES TAB
  if (tab === 'messages') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>Messages</h2>
        </div>
        <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>No messages yet</div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400', borderTop: tab === key ? '3px solid #000' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // PROFILE TAB
  if (tab === 'profile') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>Profile</h2>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e91e63', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>{user?.email?.split('@')[0]}</p>
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>{user?.email}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>{posts.length}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Posts</p></div>
            <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>{following.size}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Following</p></div>
            <div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000' }}>{users.length}</p><p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Users</p></div>
          </div>
          <button onClick={async () => { await signOut(auth); router.push('/join'); }} style={{ width: '100%', padding: '12px', backgroundColor: '#e5e5e5', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#000' }}>
            Logout
          </button>
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', maxWidth: '500px', margin: '0 auto' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400', borderTop: tab === key ? '3px solid #000' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }
}
// cache bust
