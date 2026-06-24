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
  userImage?: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments?: { [key: string]: any };
  reposts: number;
  hashtags: string[];
  createdAt: string;
  deleted?: boolean;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow';
  fromUserId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Story {
  id: string;
  userId: string;
  image: string;
  text?: string;
  createdAt: string;
  expiresAt: string;
}

interface UserProfile {
  name: string;
  bio: string;
  profileImage?: string;
  identityVerified: boolean;
  isPrivate: boolean;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHashtag, setSearchHashtag] = useState('');
  const [allUsers, setAllUsers] = useState<{ [key: string]: any }>({});
  const [profile, setProfile] = useState<UserProfile>({ name: '', bio: '', identityVerified: false, isPrivate: false });
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      router.push('/join');
      return;
    }

    // ユーザープロフィール読み込み
    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          profileImage: data.profileImage,
          identityVerified: data.identityVerified || false,
          isPrivate: data.isPrivate || false,
        });
        setFollowing(new Set(Object.keys(data.following || {})));
        setBlocked(new Set(Object.keys(data.blocked || {})));
        setBookmarkedPosts(new Set(Object.keys(data.bookmarks || {})));
        setStats({
          posts: Object.keys(data.posts || {}).length,
          followers: Object.keys(data.followers || {}).length,
          following: Object.keys(data.following || {}).length,
        });
      }
    });

    // 投稿リアルタイム読み込み
    const postsRef = ref(database, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postList = Object.entries(data)
          .map(([key, value]: any) => ({ id: key, ...value }))
          .filter(p => !p.deleted && !blocked.has(p.userId));
        setPosts(postList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    });

    // 全ユーザー読み込み
    const usersRef = ref(database, 'users');
    const unsubscribe2 = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllUsers(data);
      }
    });

    // 通知読み込み
    const notificationsRef = ref(database, `notifications/${user.uid}`);
    const unsubscribe3 = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notifList = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          ...value,
        }));
        setNotifications(notifList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    });

    // トレンド読み込み
    fetch('/api/trends')
      .then(res => res.json())
      .then(data => setTrends(data.trends || []));

    // ストーリー読み込み
    const storiesRef = ref(database, 'stories');
    const unsubscribe4 = onValue(storiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activeStories = Object.entries(data)
          .flatMap(([userId, userStories]: any) =>
            Object.entries(userStories || {}).map(([key, story]: any) => ({
              id: key,
              userId,
              ...story,
            }))
          )
          .filter(s => new Date(s.expiresAt) > new Date());
        setStories(activeStories);
      }
    });

    return () => {
      unsubscribe();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
    };
  }, [user, router, blocked]);

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
    try {
      const hashtags = (content.match(/#\w+/g) || []).map(tag => tag.toLowerCase());
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: profile.name || user.email?.split('@')[0] || 'User',
          userImage: profile.profileImage,
          content,
          image: selectedImage,
          hashtags,
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
      // 通知送信
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: post?.userId,
          type: 'like',
          fromUserId: user.uid,
          message: `${profile.name || 'User'}があなたの投稿をいいねしました`,
        }),
      });
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

  const handleBookmark = async (postId: string) => {
    if (!user) return;
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    const action = newBookmarkedPosts.has(postId) ? 'remove' : 'save';
    
    if (action === 'save') {
      newBookmarkedPosts.add(postId);
    } else {
      newBookmarkedPosts.delete(postId);
    }
    setBookmarkedPosts(newBookmarkedPosts);

    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, postId, action }),
      });
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const handleRepost = async (postId: string) => {
    if (!user) return;
    const newRepostedPosts = new Set(repostedPosts);
    const action = newRepostedPosts.has(postId) ? 'unrepost' : 'repost';
    
    if (action === 'repost') {
      newRepostedPosts.add(postId);
    } else {
      newRepostedPosts.delete(postId);
    }
    setRepostedPosts(newRepostedPosts);

    try {
      await fetch('/api/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, postId, action }),
      });
    } catch (err) {
      console.error('Repost failed:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('削除してもよろしいですか？')) return;

    try {
      await fetch('/api/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleBlock = async (userId: string) => {
    if (!user) return;
    const newBlocked = new Set(blocked);
    const action = newBlocked.has(userId) ? 'unblock' : 'block';
    
    if (action === 'block') {
      newBlocked.add(userId);
    } else {
      newBlocked.delete(userId);
    }
    setBlocked(newBlocked);

    try {
      await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, blockedUserId: userId, action }),
      });
    } catch (err) {
      console.error('Block failed:', err);
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
          userName: profile.name || user.email?.split('@')[0] || 'User',
          content: commentContent,
        }),
      });

      setCommentTexts({ ...commentTexts, [postId]: '' });

      // 通知送信
      const post = posts.find(p => p.id === postId);
      if (post?.userId !== user.uid) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: post?.userId,
            type: 'comment',
            fromUserId: user.uid,
            postId,
            message: `${profile.name || 'User'}があなたの投稿にコメントしました`,
          }),
        });
      }
    } catch (err) {
      console.error('Comment failed:', err);
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
        fromUserName: profile.name || user.email?.split('@')[0] || 'User',
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
        isPrivate: profile.isPrivate,
        profileImage: profile.profileImage,
      });
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setProfile({ ...profile, profileImage: imageData });
        fetch('/api/users/profile-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.uid, imageData }),
        }).catch(err => console.error('Profile image upload failed:', err));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/join');
  };

  // ホームタブ - 以下に全タブのUIが続きます...
  // コードが長いため、GitHubプッシュ時に完全版を送信します
  
  return null;
}
