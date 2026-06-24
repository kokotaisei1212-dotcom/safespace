'use client';

import { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref, onValue, update, get, push, set } from 'firebase/database';

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments?: { [key: string]: any };
  createdAt: string;
}

interface UserProfile {
  name: string;
  bio: string;
  identityVerified: boolean;
}

interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  content: string;
  createdAt: string;
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  useEffect(() => {
    if (!selectedUserId || !user) return;

    const conversationId = [user.uid, selectedUserId].sort().join('_');
    const messagesRef = ref(database, `messages/${conversationId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));
        setMessages(messageList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }
    });

    return () => unsubscribe();
  }, [selectedUserId, user]);

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
          image: selectedImage,
        }),
      });

      if (!response.ok) throw new Error('投稿に失敗しました');
      setContent('');
      setSelectedImage(null);
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
      console.error('Like failed:', err);
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
      console.error('Comment failed:', err);
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
      console.error('Follow failed:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !selectedUserId) return;

    try {
      const conversationId = [user.uid, selectedUserId].sort().join('_');
      const messagesRef = ref(database, `messages/${conversationId}`);
      const newMessageRef = push(messagesRef);

      await set(newMessageRef, {
        id: newMessageRef.key,
        fromUserId: user.uid,
        fromUserName: user.email?.split('@')[0] || 'User',
        content: messageText,
        createdAt: new Date().toISOString(),
      });

      setMessageText('');
    } catch (err) {
      console.error('Message send failed:', err);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (tab === 'home') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', color: '#000' }}>
        <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: '#000' }}>SafeSpace</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
          <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
            <form onSubmit={handlePost} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <textarea placeholder="What's happening?!" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', fontSize: '15px', color: '#000', minHeight: '40px', fontFamily: 'inherit', backgroundColor: '#fff', borderRadius: '20px', resize: 'vertical' }} />
                {selectedImage && (
                  <div style={{ marginTop: '12px', position: 'relative' }}>
                    <img src={selectedImage} alt="preview" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '300px' }} />
                    <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                  </div>
                )}
                {error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '8px' }}>{error}</div>}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <label style={{ cursor: 'pointer', padding: '6px 12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '20px', fontSize: '12px' }}>
                    Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  <button type="submit" disabled={loading || !content.trim()} style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', opacity: loading || !content.trim() ? 0.5 : 1 }}>
                    {loading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <p style={{ fontSize: '15px', margin: 0 }}>No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000' }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>{post.userName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {post.userId !== user?.uid && (
                    <button onClick={() => handleFollow(post.userId)} style={{ padding: '6px 12px', backgroundColor: following.has(post.userId) ? '#f0f0f0' : '#000', color: following.has(post.userId) ? '#000' : '#fff', border: following.has(post.userId) ? '1px solid #ccc' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      {following.has(post.userId) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '15px', color: '#000', margin: '12px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.content}</p>

                {post.image && (
                  <img src={post.image} alt="post" style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '12px', maxHeight: '400px' }} />
                )}

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', color: '#666', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
                  <button onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: likedPosts.has(post.id) ? '#e91e63' : '#666', padding: 0 }}>
                    {likedPosts.has(post.id) ? 'Like' : 'Like'} {post.likes}
                  </button>
                  <button onClick={() => setExpandedComments(new Set(expandedComments).add(post.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#666', padding: 0 }}>
                    Comment {Object.keys(post.comments || {}).length}
                  </button>
                </div>

                {expandedComments.has(post.id) && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e5e5' }}>
                    {Object.values(post.comments || {}).map((comment: any) => (
                      <div key={comment.id} style={{ marginBottom: '12px', fontSize: '14px' }}>
                        <strong style={{ color: '#000' }}>{comment.userName}</strong>
                        <p style={{ color: '#333', margin: '4px 0' }}>{comment.content}</p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input type="text" placeholder="Add a comment..." value={commentTexts[post.id] || ''} onChange={(e) => setCommentTexts({ ...commentTexts, [post.id]: e.target.value })} style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '20px', fontSize: '14px', color: '#000', backgroundColor: '#fff' }} />
                      <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>Post</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400' }}>{label}</button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'search') {
    const filteredUsers = Object.entries(allUsers)
      .filter(([id, u]: any) => id !== user?.uid && searchQuery && (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())))
      .map(([id, u]: any) => ({ id, ...u }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', color: '#000', paddingBottom: '60px' }}>
        <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
          <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #e5e5e5', borderRadius: '20px', fontSize: '15px', color: '#000', backgroundColor: '#fff' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredUsers.map((u: any) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#000' }}>{u.name || u.email?.split('@')[0]}</p>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{u.email}</p>
              </div>
              <button onClick={() => handleFollow(u.id)} style={{ padding: '6px 16px', backgroundColor: following.has(u.id) ? '#f0f0f0' : '#000', color: following.has(u.id) ? '#000' : '#fff', border: following.has(u.id) ? '1px solid #ccc' : 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                {following.has(u.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400' }}>{label}</button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'messages') {
    const userConversations = Object.entries(allUsers)
      .filter(([id]: any) => id !== user?.uid)
      .map(([id, u]: any) => ({ id, ...u }));

    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fff', color: '#000', paddingBottom: '0' }}>
        <div style={{ width: '280px', borderRight: '1px solid #e5e5e5', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {userConversations.map((u: any) => (
              <div key={u.id} onClick={() => setSelectedUserId(u.id)} style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', cursor: 'pointer', backgroundColor: selectedUserId === u.id ? '#f0f0f0' : '#fff' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0', color: '#000' }}>{u.name || u.email?.split('@')[0]}</p>
                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{u.email}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedUserId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px' }}>
              <h3 style={{ margin: 0, color: '#000' }}>{allUsers[selectedUserId]?.name || allUsers[selectedUserId]?.email?.split('@')[0]}</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ textAlign: msg.fromUserId === user?.uid ? 'right' : 'left' }}>
                  <div style={{ display: 'inline-block', maxWidth: '60%', padding: '10px 14px', borderRadius: '18px', backgroundColor: msg.fromUserId === user?.uid ? '#000' : '#f0f0f0', color: msg.fromUserId === user?.uid ? '#fff' : '#000', fontSize: '14px', wordBreak: 'break-word' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e5e5', display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '20px', fontSize: '14px', color: '#000', backgroundColor: '#fff' }} />
              <button onClick={handleSendMessage} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>Send</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            Select a message
          </div>
        )}

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400' }}>{label}</button>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'profile') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fff', color: '#000', paddingBottom: '60px' }}>
        <div style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Profile</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>Logout</button>
        </div>

        <div style={{ backgroundColor: '#f0f0f0', height: '150px' }} />

        <div style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#000', border: '3px solid #fff' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditing(!editing)} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', color: '#000' }}>
            {profile.name || user?.email}
          </p>
          <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>{user?.email}</p>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>{stats.posts}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Posts</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>{stats.followers}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Followers</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>{stats.following}</p>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>Following</p>
            </div>
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input type="text" placeholder="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', color: '#000', backgroundColor: '#fff' }} />
              <textarea placeholder="Bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '14px', color: '#000', backgroundColor: '#fff', minHeight: '80px', fontFamily: 'inherit' }} />
              <button onClick={handleSaveProfile} disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>{profile.bio || 'No bio set'}</p>
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e5e5e5', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
          {[{ key: 'home', label: 'Home' }, { key: 'search', label: 'Explore' }, { key: 'messages', label: 'Messages' }, { key: 'profile', label: 'Profile' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px', fontSize: '12px', color: tab === key ? '#000' : '#999', fontWeight: tab === key ? '600' : '400' }}>{label}</button>
          ))}
        </div>
      </div>
    );
  }
}
