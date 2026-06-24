import { useState } from 'react';
import { signOut, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Theme, Lang, Colors } from '@/app/types';

interface SettingsProps {
  theme: Theme;
  lang: Lang;
  c: Colors;
  onThemeChange: (theme: Theme) => void;
  onLangChange: (lang: Lang) => void;
}

export default function Settings({ theme, lang, c, onThemeChange, onLangChange }: SettingsProps) {
  const [settingsTab, setSettingsTab] = useState<'account' | 'privacy' | 'notifications' | 'blocked'>('account');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [allowTags, setAllowTags] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Both fields required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Minimum 6 characters');
      return;
    }

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordError('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password updated');
      }
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Settings</h2>
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${c.border}`, overflowX: 'auto' }}>
        {(['account', 'privacy', 'notifications', 'blocked'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSettingsTab(tab)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: settingsTab === tab ? 'transparent' : 'transparent',
              color: settingsTab === tab ? '#ff1493' : c.text,
              border: 'none',
              borderBottom: settingsTab === tab ? '2px solid #ff1493' : 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            {tab === 'account' ? 'Account' : tab === 'privacy' ? 'Privacy' : tab === 'notifications' ? 'Notifications' : 'Blocked'}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        {settingsTab === 'account' && (
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Password</h3>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
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
                  marginBottom: '8px',
                }}
              />
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
              {passwordError && <p style={{ margin: '4px 0 0 0', color: '#ff4458', fontSize: '11px' }}>{passwordError}</p>}
            </div>
            <button
              onClick={handlePasswordChange}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#ff1493',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '24px',
              }}
            >
              Update Password
            </button>

            <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Theme</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: theme === t ? '#ff1493' : c.input,
                    color: theme === t ? '#fff' : c.text,
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {t === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 16px 0' }}>Language</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {(['ja', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: lang === l ? '#ff1493' : c.input,
                    color: lang === l ? '#fff' : c.text,
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {l === 'ja' ? '日本語' : 'English'}
                </button>
              ))}
            </div>

            <button
              onClick={async () => {
                await signOut(auth);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Log Out
            </button>
          </div>
        )}

        {settingsTab === 'privacy' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Private Account</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Only approved followers can see your posts</p>
              </div>
              <input
                type="checkbox"
                checked={privateAccount}
                onChange={(e) => setPrivateAccount(e.target.checked)}
                style={{ cursor: 'pointer', width: '20px', height: '20px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Allow Messages</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>From anyone</p>
              </div>
              <input
                type="checkbox"
                checked={allowMessages}
                onChange={(e) => setAllowMessages(e.target.checked)}
                style={{ cursor: 'pointer', width: '20px', height: '20px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Allow Tags</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>In posts and stories</p>
              </div>
              <input
                type="checkbox"
                checked={allowTags}
                onChange={(e) => setAllowTags(e.target.checked)}
                style={{ cursor: 'pointer', width: '20px', height: '20px' }}
              />
            </div>
          </div>
        )}

        {settingsTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Notifications</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Likes, comments, follows</p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                style={{ cursor: 'pointer', width: '20px', height: '20px' }}
              />
            </div>
          </div>
        )}

        {settingsTab === 'blocked' && (
          <div>
            {blockedUsers.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#999', textAlign: 'center', padding: '24px 0' }}>No blocked users</p>
            ) : (
              blockedUsers.map((user) => (
                <div key={user} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${c.border}` }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>@{user}</p>
                  <button
                    onClick={() => setBlockedUsers(blockedUsers.filter((u) => u !== user))}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: c.input,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
