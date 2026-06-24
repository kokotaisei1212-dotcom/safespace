import { signOut } from 'firebase/auth';
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
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Settings</h2>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${c.border}` }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Theme</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onThemeChange(t)}
                style={{
                  flex: 1,
                  padding: '8px',
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
        </div>

        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${c.border}` }}>
          <p style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' }}>Language</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['ja', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                style={{
                  flex: 1,
                  padding: '8px',
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
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
