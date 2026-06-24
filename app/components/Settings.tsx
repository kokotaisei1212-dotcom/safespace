import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Theme, Lang, Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface SettingsProps {
  theme: Theme;
  lang: Lang;
  c: Colors;
  i18n: any;
  onThemeChange: (theme: Theme) => void;
  onLangChange: (lang: Lang) => void;
}

export default function Settings({ 
  theme, 
  lang, 
  c, 
  i18n, 
  onThemeChange, 
  onLangChange 
}: SettingsProps) {
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
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: `1px solid ${c.border}`,
        position: 'sticky',
        top: 0,
        backgroundColor: c.bg,
        zIndex: 10
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: '600',
          letterSpacing: '-0.5px'
        }}>
          Settings
        </h1>
      </div>

      {/* Theme Section */}
      <div style={{ 
        padding: '16px',
        borderBottom: `1px solid ${c.border}`
      }}>
        <h2 style={{ 
          margin: '0 0 12px 0',
          fontSize: '13px',
          fontWeight: '600',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Appearance
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['dark', 'light'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onThemeChange(t)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: theme === t ? c.accent : c.input,
                color: theme === t ? '#fff' : c.text,
                border: `1px solid ${theme === t ? c.accent : c.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </div>

      {/* Language Section */}
      <div style={{ 
        padding: '16px',
        borderBottom: `1px solid ${c.border}`
      }}>
        <h2 style={{ 
          margin: '0 0 12px 0',
          fontSize: '13px',
          fontWeight: '600',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Language
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ja', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: lang === l ? c.accent : c.input,
                color: lang === l ? '#fff' : c.text,
                border: `1px solid ${lang === l ? c.accent : c.border}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {l === 'ja' ? 'Japanese' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div style={{ 
        padding: '16px',
        borderBottom: `1px solid ${c.border}`
      }}>
        <h2 style={{ 
          margin: '0 0 12px 0',
          fontSize: '13px',
          fontWeight: '600',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Account
        </h2>

        <button style={{
          width: '100%',
          padding: '12px',
          backgroundColor: c.input,
          color: c.text,
          border: `1px solid ${c.border}`,
          borderRadius: '6px',
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.input)}
        >
          Change Password
        </button>

        <button style={{
          width: '100%',
          padding: '12px',
          backgroundColor: c.input,
          color: c.text,
          border: `1px solid ${c.border}`,
          borderRadius: '6px',
          fontSize: '13px',
          cursor: 'pointer',
          marginBottom: '8px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.input)}
        >
          Privacy Settings
        </button>

        <button style={{
          width: '100%',
          padding: '12px',
          backgroundColor: c.input,
          color: c.text,
          border: `1px solid ${c.border}`,
          borderRadius: '6px',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.input)}
        >
          Block List
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ 
        padding: '16px',
        borderBottom: `1px solid ${c.border}`
      }}>
        <h2 style={{ 
          margin: '0 0 12px 0',
          fontSize: '13px',
          fontWeight: '600',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Danger Zone
        </h2>

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff4458',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff2d42')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff4458')}
        >
          Log Out
        </button>
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '24px 16px',
        textAlign: 'center',
        color: '#999',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>SafeSpace v1.0.0</p>
        <p style={{ margin: '4px 0 0 0' }}>Women-only platform for creators</p>
      </div>
    </div>
  );
}
