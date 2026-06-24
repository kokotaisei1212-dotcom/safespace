import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Theme, Lang, Colors } from '@/app/types';
import { SettingsIcon } from './Icons';

interface SettingsProps {
  theme: Theme;
  lang: Lang;
  c: Colors;
  onThemeChange: (theme: Theme) => void;
  onLangChange: (lang: Lang) => void;
}

export default function Settings({ theme, lang, c, onThemeChange, onLangChange }: SettingsProps) {
  const [passwordChange, setPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [blockList, setBlockList] = useState<string[]>([]);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
  });

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields required');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordSuccess('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordChange(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ 
      maxWidth: '468px', 
      margin: '0 auto', 
      backgroundColor: c.bg, 
      color: c.text, 
      minHeight: '100vh', 
      borderLeft: `1px solid ${c.border}`, 
      borderRight: `1px solid ${c.border}`,
      paddingBottom: '80px'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: `1px solid ${c.border}`,
        position: 'sticky',
        top: 0,
        backgroundColor: c.bg,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <SettingsIcon size={24} />
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Settings</h1>
      </div>

      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account</h2>
        
        <button
          onClick={() => setPasswordChange(!passwordChange)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: c.input,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.2s',
          }}
        >
          {passwordChange ? 'Cancel' : 'Change Password'}
        </button>

        {passwordChange && (
          <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: c.input, borderRadius: '6px' }}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {passwordError && <p style={{ margin: '8px 0 0 0', color: '#ff4458', fontSize: '12px' }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ margin: '8px 0 0 0', color: '#0095f6', fontSize: '12px' }}>{passwordSuccess}</p>}
            <button
              onClick={handlePasswordChange}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#0095f6',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Save Password
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Privacy</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px' }}>Private Account</span>
          <input
            type="checkbox"
            checked={privateAccount}
            onChange={(e) => setPrivateAccount(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <button
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: c.input,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.2s',
          }}
        >
          Block List ({blockList.length})
        </button>
      </div>

      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notifications</h2>
        
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{key}</span>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appearance</h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: theme === t ? '#ff1493' : c.input,
                color: theme === t ? '#fff' : c.text,
                border: `1px solid ${theme === t ? '#ff1493' : c.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Language</h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ja', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: lang === l ? '#ff1493' : c.input,
                color: lang === l ? '#fff' : c.text,
                border: `1px solid ${lang === l ? '#ff1493' : c.border}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {l === 'ja' ? 'Japanese' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danger Zone</h2>
        
        <button
          onClick={() => {
            if (confirm('Are you sure? This will log you out.')) {
              handleLogout();
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff4458',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '8px',
            transition: 'background-color 0.2s',
          }}
        >
          Log Out
        </button>

        <button
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#8B0000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
