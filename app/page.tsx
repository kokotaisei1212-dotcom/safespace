'use client';

import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    
    // ログイン状態なら Feed へ
    if (user) {
      router.push('/feed');
      return;
    }

    // 非ログイン状態なら Join へ
    router.push('/join');
  }, [auth, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>読み込み中...</p>
    </div>
  );
}
