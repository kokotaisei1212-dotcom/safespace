import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface AuthProps {
  c: Colors;
}

export default function Auth({ c }: AuthProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: string) => {
    setEmail(e);
    if (e && !validateEmail(e)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: string) => {
    setPassword(e);
    if (tab === 'signup' && e.length > 0 && e.length < 6) {
      setPasswordError('Minimum 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (err.code === 'auth/user-not-found') {
        setError('User not found');
      } else if (err.code === 'auth/wrong-password') {
        setError('Wrong password');
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError('Password minimum 6 characters');
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
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already exists');
      } else {
        setError('Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || Boolean(emailError) || Boolean(passwordError);

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
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '300',
          fontStyle: 'italic',
          margin: '0 0 8px 0',
          background: gradients.pink,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SafeSpace
        </h1>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Women-only</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setTab('login')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: tab === 'login' ? '#ff1493' : c.input,
            color: tab === 'login' ? '#fff' : c.text,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          Log In
        </button>
        <button
          onClick={() => setTab('signup')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: tab === 'signup' ? '#ff1493' : c.input,
            color: tab === 'signup' ? '#fff' : c.text,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={tab === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Email"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${emailError ? '#ff4458' : c.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {emailError && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ff4458' }}>{emailError}</p>}
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${passwordError ? '#ff4458' : c.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {passwordError && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ff4458' }}>{passwordError}</p>}
        </div>

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
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}

        {error && <p style={{ margin: '8px 0', color: '#ff4458', fontSize: '12px' }}>{error}</p>}

        <button
          type="submit"
          disabled={isDisabled}
          style={{
            width: '100%',
            padding: '12px',
            background: gradients.pink,
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
            marginTop: '8px',
          }}
        >
          {isLoading ? 'Loading...' : (tab === 'login' ? 'Log In' : 'Sign Up')}
        </button>
      </form>
    </div>
  );
}
