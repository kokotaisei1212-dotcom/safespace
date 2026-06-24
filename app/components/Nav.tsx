import { TabType, Colors } from '@/app/types';
import { HomeIcon, SearchIcon, MessageIcon, UserIcon, ExploreIcon } from './Icons';

interface NavProps {
  tab: TabType;
  c: Colors;
  onTabChange: (tab: TabType) => void;
}

export default function Nav({ tab, c, onTabChange }: NavProps) {
  const navItems: Array<{ key: TabType; icon: React.ReactNode }> = [
    { key: 'home', icon: <HomeIcon size={24} /> },
    { key: 'search', icon: <SearchIcon size={24} /> },
    { key: 'messages', icon: <MessageIcon size={24} /> },
    { key: 'profile', icon: <UserIcon size={24} /> },
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
            color: c.text,
            opacity: tab === item.key ? 1 : 0.5,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
