import { TabType, Colors } from '@/app/types';

interface NavProps {
  tab: TabType;
  c: Colors;
  onTabChange: (tab: TabType) => void;
}

export default function Nav({ tab, c, onTabChange }: NavProps) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '468px', margin: '0 auto', zIndex: 50 }}>
      <button onClick={() => onTabChange('home')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', opacity: tab === 'home' ? 1 : 0.5 }}>🏠</button>
      <button onClick={() => onTabChange('search')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', opacity: tab === 'search' ? 1 : 0.5 }}>🔍</button>
      <button onClick={() => onTabChange('explore')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', opacity: tab === 'explore' ? 1 : 0.5 }}>🎬</button>
      <button onClick={() => onTabChange('messages')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', opacity: tab === 'messages' ? 1 : 0.5 }}>💬</button>
      <button onClick={() => onTabChange('profile')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', opacity: tab === 'profile' ? 1 : 0.5 }}>👤</button>
    </div>
  );
}
