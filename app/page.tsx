'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TabType, Theme, Lang } from '@/app/types';
import { getColors } from '@/app/utils/theme';
import { i18n } from '@/app/utils/i18n';
import Auth from '@/app/components/Auth';
import Onboarding from '@/app/components/Onboarding';
import Home from '@/app/components/Home';
import Search from '@/app/components/Search';
import Profile from '@/app/components/Profile';
import Settings from '@/app/components/Settings';
import Messages from '@/app/components/Messages';
import Explore from '@/app/components/Explore';
import Nav from '@/app/components/Nav';
import TipModal from '@/app/components/TipModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<TabType>('home');
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Lang>('ja');
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [tipModal, setTipModal] = useState<{ creatorId: string; creatorName: string } | null>(null);

  const c = getColors(theme);
  const t = i18n[lang];

  useEffect(() => {
    const browserLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
    setLang(browserLang as Lang);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const onboardingComplete = localStorage.getItem(`safespace_onboarded_${currentUser.uid}`);
        setOnboarded(onboardingComplete === 'true');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div style={{ backgroundColor: c.bg, color: c.text, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Auth c={c} />;
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

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      {tab === 'home' && (
        <Home
          user={user}
          c={c}
        />
      )}

      {tab === 'search' && (
        <Search
          c={c}
          onViewUser={() => setTab('profile')}
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
          c={c}
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

      <Nav tab={tab} c={c} onTabChange={setTab} />

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
