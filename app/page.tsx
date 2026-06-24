'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TabType, Theme, Lang } from '@/app/types';
import { getColors } from '@/app/utils/theme';
import { i18n } from '@/app/utils/i18n';
import { useFirebase } from '@/app/hooks/useFirebase';
import Auth from '@/app/components/Auth';
import Onboarding from '@/app/components/Onboarding';
import AdminDashboard from '@/app/components/AdminDashboard';
import Home from '@/app/components/Home';
import Search from '@/app/components/Search';
import Profile from '@/app/components/Profile';
import Settings from '@/app/components/Settings';
import Messages from '@/app/components/Messages';
import Explore from '@/app/components/Explore';
import Nav from '@/app/components/Nav';
import TipModal from '@/app/components/TipModal';

const ADMIN_EMAIL = 'admin@safespace.jp';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<TabType>('home');
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>('ja');
  const [following, setFollowing] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [tipModal, setTipModal] = useState<{ creatorId: string; creatorName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { posts, users, profile, loadData, createPost, deletePost } = useFirebase();
  const c = getColors(theme);
  const t = i18n[lang];

  useEffect(() => {
    const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
    setLang(browserLang as Lang);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
        
        // オンボーディング完了を確認
        const onboardingComplete = localStorage.getItem(`safespace_onboarded_${currentUser.uid}`);
        setOnboarded(onboardingComplete === 'true');
        
        await loadData(currentUser.uid);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loadData]);

  if (isLoading) {
    return <div style={{ backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  // 運営者ダッシュボード（ログイン不要）
  if (isAdmin && !user) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh' }}>
        <AdminDashboard c={c} transactions={[]} users={users} />
      </div>
    );
  }

  if (!user) {
    return <Auth c={c} i18n={t} />;
  }

  if (!onboarded) {
    return (
      <Onboarding
        user={user}
        c={c}
        onComplete={() => {
          localStorage.setItem(`safespace_onboarded_${user.uid}`, 'true');
          setOnboarded(true);
        }}
      />
    );
  }

  if (isAdmin) {
    return (
      <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
        <AdminDashboard c={c} transactions={[]} users={users} />
        <Nav tab={tab} c={c} onTabChange={setTab} />
      </div>
    );
  }

  const displayProfile = viewingUser || profile;

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      {tab === 'home' && (
        <Home
          user={user}
          posts={posts}
          c={c}
          onCreatePost={(content) => createPost(user, profile, content)}
          onDeletePost={deletePost}
          onLike={(id) => setLikedPosts(likedPosts.includes(id) ? likedPosts.filter(x => x !== id) : [...likedPosts, id])}
          onTip={(postId, creatorId) => {
            const creator = posts.find(p => p.id === postId);
            if (creator) {
              setTipModal({ creatorId, creatorName: creator.userName });
            }
          }}
          likedPosts={likedPosts}
        />
      )}

      {tab === 'search' && (
        <Search
          users={users}
          following={following}
          blocked={blocked}
          c={c}
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
          isViewingOther={!!viewingUser}
          onFollow={(id) => setFollowing(following.includes(id) ? following.filter(x => x !== id) : [...following, id])}
        />
      )}

      {tab === 'settings' && (
        <Settings
          theme={theme}
          lang={lang}
          c={c}
          onThemeChange={setTheme}
          onLangChange={setLang}
        />
      )}

      <Nav tab={tab} c={c} onTabChange={(t) => { setTab(t); setViewingUser(null); }} />

      {tipModal && (
        <TipModal
          c={c}
          creatorName={tipModal.creatorName}
          onClose={() => setTipModal(null)}
          onSend={async (amount) => {
            console.log(`Tip $${amount} to ${tipModal.creatorId}`);
            setTipModal(null);
          }}
        />
      )}
    </div>
  );
}
