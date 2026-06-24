import { useState, useMemo } from 'react';
import { UserProfile, Colors } from '@/app/types';
import { SearchIcon } from './Icons';
import { gradients } from '@/app/utils/theme';

interface SearchProps {
  users: UserProfile[];
  following: string[];
  blocked: string[];
  c: Colors;
  onFollow: (userId: string) => void;
  onViewUser: (user: UserProfile) => void;
}

export default function Search({ users, following, blocked, c, onFollow, onViewUser }: SearchProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'users' | 'posts'>('users');

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return users.filter(u => 
      (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)) &&
      !blocked.includes(u.id)
    ).slice(0, 20);
  }, [query, users, blocked]);

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
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: c.input, borderRadius: '20px' }}>
          <SearchIcon size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: c.text,
              border: 'none',
              outline: 'none',
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      {query && (
        <div style={{ display: 'flex', borderBottom: `1px solid ${c.border}` }}>
          {(['users', 'posts'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: 'transparent',
                color: tab === t ? c.text : '#999',
                border: 'none',
                borderBottom: tab === t ? `2px solid ${c.text}` : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div>
        {!query ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#999' }}>
            <SearchIcon size={48} />
            <p style={{ margin: '16px 0 0 0', fontSize: '13px' }}>Search users, posts, hashtags</p>
          </div>
        ) : tab === 'users' ? (
          filteredUsers.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#999', fontSize: '13px' }}>No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', flex: 1 }} onClick={() => onViewUser(user)}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: gradients.pink }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{user.name}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => onFollow(user.id)}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: following.includes(user.id) ? c.input : '#0095f6',
                    color: following.includes(user.id) ? c.text : '#fff',
                    border: `1px solid ${following.includes(user.id) ? c.border : '#0095f6'}`,
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {following.includes(user.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))
          )
        ) : (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#999', fontSize: '13px' }}>Posts coming soon</div>
        )}
      </div>
    </div>
  );
}
