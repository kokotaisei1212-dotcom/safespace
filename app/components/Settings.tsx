import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Theme, Lang, Colors } from '@/app/types';

interface SettingsProps {
  theme: Theme;
  lang: Lang;
  c: Colors;
  i18n: any;
  onThemeChange: (theme: Theme) => void;
  onLangChange: (lang: Lang) => void;
}

export default function Settings({ theme, lang, c, i18n, onThemeChange, onLangChange }: SettingsProps) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 24px 0' }}>Settings</h1>

      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0' }}>Theme</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['dark', 'light'] as const).map((t) => (
            <button key={t} onClick={() => onThemeChange(t)} style={{ flex: 1, padding: '8px', backgroundColor: theme === t ? c.accent : c.button, color: theme === t ? '#fff' : c.text, border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${c.border}` }}>
        <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 12px 0' }}>Language</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ja', 'en'] as const).map((l) => (
            <button key={l} onClick={() => onLangChange(l)} style={{ flex: 1, padding: '8px', backgroundColor: lang === l ? c.accent : c.button, color: lang === l ? '#fff' : c.text, border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {l === 'ja' ? '日本語' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: c.button, color: c.text, border: `1px solid ${c.border}`, borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Log Out</button>
    </div>
  );
}
