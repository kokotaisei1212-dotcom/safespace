'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TabType, Theme, Lang } from '@/app/types';
import { getColors } from '@/app/utils/theme';
import { i18n } from '@/app/utils/i18n';
import { useFirebase } from '@/app/hooks/useFirebase';
import Auth from '@/app/components/Auth';
import Home from '@/app/components/Home';
import Search from '@/app/components/Search';
import Profile from '@/app/components/Profile';
import Settings from '@/app/components/Settings';
import Messages from '@/app/components/Messages';
import Explore from '@/app/components/Explore';
import Nav from '@/app/components/Nav';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabType>('home');
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>('ja');
  const [following, setFollowing] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);

  const { posts, users, profile, loadData, createPost, deletePost, updateProfile } = useFirebase();
  const c = getColors(theme);
  const t = i18n[lang];

  useEffect(() => {
    const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
    setLang(browserLang as Lang);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [loadData]);

  if (!user) {
    return <Auth c={c} i18n={t} />;
  }

  const displayProfile = viewingUser || profile;

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      {tab === 'home' && (
        <Home
          user={user}
          posts={posts}
          profile={profile}
          c={c}
          onCreatePost={(content) => createPost(user, profile, content)}
          onDeletePost={deletePost}
          onLike={(id) => setLikedPosts(likedPosts.includes(id) ? likedPosts.filter(x => x !== id) : [...likedPosts, id])}
          onComment={(postId, text) => console.log('Comment:', postId, text)}
          likedPosts={likedPosts}
        />
      )}

      {tab === 'search' && (
        <Search
          users={users}
          following={following}
          blocked={blocked}
          c={c}
          i18n={t}
          onFollow={(id) => setFollowing(following.includes(id) ? following.filter(x => x !== id) : [...following, id])}
          onViewUser={(u) => { setViewingUser(u); setTab('profile'); }}
        />
      )}

      {tab === 'messages' && (
        <Messages c={c} />
      )}

      {tab === 'explore' && (
        <Explore c={c} />
      )}

      {tab === 'profile' && (
        <Profile
          user={user}
          displayProfile={displayProfile}
          posts={posts}
          following={following}
          c={c}
          i18n={t}
          isViewingOther={!!viewingUser}
          onFollow={(id) => setFollowing(following.includes(id) ? following.filter(x => x !== id) : [...following, id])}
        />
      )}

      {tab === 'settings' && (
        <Settings
          theme={theme}
          lang={lang}
          c={c}
          i18n={t}
          onThemeChange={setTheme}
          onLangChange={setLang}
        />
      )}

      <Nav tab={tab} c={c} onTabChange={(t) => { setTab(t); setViewingUser(null); }} />
    </div>
  );
}
