import { User } from 'firebase/auth';
import { Colors } from '@/app/types';

interface ProfileProps {
  user: User;
  c: Colors;
}

export default function Profile({ user, c }: ProfileProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '24px', textAlign: 'center', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: c.button, margin: '0 auto 16px' }} />
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{user.email?.split('@')[0]}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#999' }}>@{user.email?.split('@')[0]}</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-around', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>0</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Posts</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>0</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Followers</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>0</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Following</p>
        </div>
      </div>

      <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
        <p>No posts yet</p>
      </div>
    </div>
  );
}
