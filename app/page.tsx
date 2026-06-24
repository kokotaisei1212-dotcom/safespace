'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, child, get } from 'firebase/database';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/join');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>SafeSpace</h1>
        <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0 0' }}>{user?.email}</p>
      </div>

      <button
        onClick={async () => {
          await signOut(auth);
          router.push('/join');
        }}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#e5e5e5',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Logout
      </button>
    </div>
  );
}
