import { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { ref, get, push, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Post, UserProfile } from '@/app/types';

export const useFirebase = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadData = useCallback(async (uid: string) => {
    try {
      const profileRef = ref(database, `users/${uid}`);
      const profileSnapshot = await get(profileRef);
      if (profileSnapshot.exists()) setProfile(profileSnapshot.val());

      const postsRef = ref(database, 'posts');
      const postsSnapshot = await get(postsRef);
      if (postsSnapshot.exists()) {
        const data = Object.entries(postsSnapshot.val()).map(([id, d]: any) => ({
          id, ...d, comments: d.comments || [],
        }));
        setPosts(data.sort((a, b) => b.timestamp - a.timestamp));
      }

      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      if (usersSnapshot.exists()) {
        const data = Object.entries(usersSnapshot.val()).filter(([id]) => id !== uid).map(([id, d]: any) => ({ id, ...d }));
        setUsers(data.filter((u: any) => !u.name?.includes('bot')));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const createPost = useCallback(async (user: User | null, profile: UserProfile | null, content: string) => {
    if (!content.trim() || !user) return;
    try {
      await push(ref(database, 'posts'), {
        userId: user.uid,
        userName: profile?.name || 'User',
        content,
        timestamp: Date.now(),
        likes: 0,
        comments: [],
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await remove(ref(database, `posts/${postId}`));
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error:', error);
    }
  }, [posts]);

  const updateProfile = useCallback(async (uid: string, data: any) => {
    try {
      await update(ref(database, `users/${uid}`), data);
      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  return { posts, users, profile, loadData, createPost, deletePost, updateProfile };
};
