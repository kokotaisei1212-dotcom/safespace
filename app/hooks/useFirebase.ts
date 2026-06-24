import { useState, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ref, get, push, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Post, UserProfile, Comment } from '@/app/types';

export function useFirebase() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadData = useCallback(async (userId: string) => {
    try {
      // Load user profile
      const userRef = ref(database, `users/${userId}`);
      const userSnap = await get(userRef);
      if (userSnap.exists()) {
        setProfile({ id: userId, ...userSnap.val() });
      }

      // Load all users
      const usersRef = ref(database, 'users');
      const usersSnap = await get(usersRef);
      if (usersSnap.exists()) {
        const allUsers: UserProfile[] = [];
        usersSnap.forEach((child) => {
          allUsers.push({ id: child.key || '', ...child.val() });
        });
        setUsers(allUsers);
      }

      // Load posts
      const postsRef = ref(database, 'posts');
      const postsSnap = await get(postsRef);
      if (postsSnap.exists()) {
        const allPosts: Post[] = [];
        postsSnap.forEach((child) => {
          allPosts.push({ id: child.key || '', ...child.val() });
        });
        setPosts(allPosts.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Load data error:', error);
    }
  }, []);

  const createPost = useCallback(async (user: User, profile: UserProfile | null, content: string) => {
    if (!content.trim()) return;
    
    try {
      const post: Post = {
        id: '',
        userId: user.uid,
        userName: profile?.name || user.email || '',
        avatar: profile?.avatar || '',
        content,
        timestamp: Date.now(),
        likes: 0,
        comments: [],
        shares: 0,
        hashtags: [],
      };

      const postsRef = ref(database, 'posts');
      const newPostRef = await push(postsRef, post);
      setPosts([{ ...post, id: newPostRef.key || '' }, ...posts]);
    } catch (error) {
      console.error('Create post error:', error);
    }
  }, [posts]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      const postRef = ref(database, `posts/${postId}`);
      await remove(postRef);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Delete post error:', error);
    }
  }, [posts]);

  return {
    posts,
    users,
    profile,
    loadData,
    createPost,
    deletePost,
  };
}
