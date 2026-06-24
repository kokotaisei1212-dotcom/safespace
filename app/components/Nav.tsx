import { TabType, Colors } from '@/app/types';

interface NavProps {
  tab: TabType;
  c: Colors;
  onTabChange: (tab: TabType) => void;
}

export default function Nav({ tab, c, onTabChange }: NavProps) {
  const navItems: Array<{ key: TabType; label: string }> = [
    { key: 'home', label: 'H' },
    { key: 'search', label: 'S' },
    { key: 'messages', label: 'C' },
    { key: 'profile', label: 'P' },
  ];

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      backgroundColor: c.bg, 
      borderTop: `1px solid ${c.border}`, 
      display: 'flex', 
      justifyContent: 'space-around', 
      maxWidth: '468px', 
      margin: '0 auto', 
      zIndex: 50
    }}>
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onTabChange(item.key)}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: c.text,
            opacity: tab === item.key ? 1 : 0.5,
            fontWeight: tab === item.key ? '600' : '400',
            transition: 'opacity 0.2s, font-weight 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = tab === item.key ? '1' : '0.5')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
