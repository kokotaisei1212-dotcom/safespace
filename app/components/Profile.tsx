import { User } from 'firebase/auth';
import { Post, UserProfile, Colors } from '@/app/types';

interface ProfileProps {
  user: User;
  displayProfile: UserProfile | null;
  posts: Post[];
  following: string[];
  c: Colors;
  i18n: any;
  isViewingOther: boolean;
  onFollow: (userId: string) => void;
}

export default function Profile({ user, displayProfile, posts, following, c, i18n, isViewingOther, onFollow }: ProfileProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>
      <div style={{ padding: '32px 16px', textAlign: 'center', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ width: '86px', height: '86px', borderRadius: '50%', backgroundColor: '#ff6b6b', margin: '0 auto 16px' }} />
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{displayProfile?.name}</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#999' }}>@{displayProfile?.username}</p>
      </div>

      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <p style={{ margin: 0, fontSize: '13px' }}>{displayProfile?.bio || 'Bio'}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px', borderBottom: `1px solid ${c.border}`, textAlign: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{posts.filter(p => p.userId === displayProfile?.id).length}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Posts</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{following.length}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Following</p>
        </div>
      </div>

      {isViewingOther && displayProfile && (
        <div style={{ padding: '16px' }}>
          <button onClick={() => onFollow(displayProfile.id)} style={{ width: '100%', padding: '8px', backgroundColor: following.includes(displayProfile.id) ? c.input : '#0095f6', color: following.includes(displayProfile.id) ? c.text : '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{following.includes(displayProfile.id) ? 'Following' : 'Follow'}</button>
        </div>
      )}
    </div>
  );
}
