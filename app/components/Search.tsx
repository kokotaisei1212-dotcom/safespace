import { useState } from 'react';
import { UserProfile, Colors } from '@/app/types';

interface SearchProps {
  users: UserProfile[];
  following: string[];
  blocked: string[];
  c: Colors;
  i18n: any;
  onFollow: (userId: string) => void;
  onViewUser: (user: UserProfile) => void;
}

export default function Search({ users, following, blocked, c, i18n, onFollow, onViewUser }: SearchProps) {
  const [query, setQuery] = useState('');

  const filtered = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) && !blocked.includes(u.id));

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 10 }}>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" style={{ width: '100%', padding: '8px 16px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div>
        {filtered.map((u) => (
          <div key={u.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => onViewUser(u)}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff6b6b' }} />
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{u.name}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{u.bio}</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onFollow(u.id); }} style={{ padding: '6px 16px', backgroundColor: following.includes(u.id) ? c.input : '#0095f6', color: following.includes(u.id) ? c.text : '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{following.includes(u.id) ? 'Following' : 'Follow'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
