import { TabType, Colors } from '@/app/types';

interface NavProps {
  tab: TabType;
  c: Colors;
  onTabChange: (tab: TabType) => void;
}

export default function Nav({ tab, c, onTabChange }: NavProps) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: c.bg, borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-around', maxWidth: '468px', margin: '0 auto', zIndex: 50 }}>
      <button onClick={() => onTabChange('home')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: c.text, opacity: tab === 'home' ? 1 : 0.5 }}>H</button>
      <button onClick={() => onTabChange('search')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: c.text, opacity: tab === 'search' ? 1 : 0.5 }}>S</button>
      <button onClick={() => onTabChange('profile')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: c.text, opacity: tab === 'profile' ? 1 : 0.5 }}>P</button>
      <button onClick={() => onTabChange('settings')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: c.text, opacity: tab === 'settings' ? 1 : 0.5 }}>G</button>
    </div>
  );
}
