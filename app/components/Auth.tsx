import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface AuthProps {
  c: Colors;
  i18n: any;
}

export default function Auth({ c, i18n }: AuthProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('All fields required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '468px', 
      margin: '0 auto', 
      backgroundColor: c.bg, 
      color: c.text, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '300',
          fontStyle: 'italic',
          margin: '0 0 8px 0',
          background: gradients.pink,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SafeSpace
        </h1>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Women-only platform</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {(['login', 'signup'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: tab === t ? '#ff1493' : c.input,
              color: tab === t ? '#fff' : c.text,
              border: `1px solid ${tab === t ? '#ff1493' : c.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form */}
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: c.input,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '12px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: c.input,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '12px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {tab === 'signup' && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}

        {error && <p style={{ margin: '12px 0', color: '#ff4458', fontSize: '12px' }}>{error}</p>}

        <button
          onClick={tab === 'login' ? handleLogin : handleSignup}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: gradients.pink,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            marginTop: '12px',
          }}
        >
          {isLoading ? 'Loading...' : (tab === 'login' ? 'Log In' : 'Sign Up')}
        </button>
      </div>
    </div>
  );
}
