import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { set, ref } from 'firebase/database';
import { Colors } from '@/app/types';

interface AuthProps {
  c: Colors;
  i18n: any;
}

export default function Auth({ c, i18n }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Login failed');
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(database, `users/${cred.user.uid}`), {
        id: cred.user.uid,
        email,
        name: email.split('@')[0],
        username: email.split('@')[0],
        bio: '',
        website: '',
        privateAccount: false,
      });
    } catch (error) {
      alert('Signup failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: c.bg, color: c.text, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <h1 style={{ fontSize: '56px', fontWeight: '300', textAlign: 'center', margin: '0 0 48px 0', background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8b8b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>SafeSpace</h1>

        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '4px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: '12px', marginBottom: '24px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '4px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />

        <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading} style={{ width: '100%', padding: '10px', marginBottom: '8px', backgroundColor: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{loading ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Sign Up')}</button>
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#0095f6', border: 'none', fontSize: '13px', cursor: 'pointer' }}>{mode === 'login' ? 'Create account' : 'Log in'}</button>
      </div>
    </div>
  );
}
