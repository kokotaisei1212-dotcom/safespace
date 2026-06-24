import { useState } from 'react';
import { User } from 'firebase/auth';
import { Post, UserProfile, Colors } from '@/app/types';

interface HomeProps {
  user: User;
  posts: Post[];
  profile: UserProfile | null;
  c: Colors;
  i18n: any;
  onCreatePost: (content: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onLike: (postId: string) => void;
  likedPosts: string[];
}

export default function Home({ user, posts, profile, c, i18n, onCreatePost, onDeletePost, onLike, likedPosts }: HomeProps) {
  const [newPost, setNewPost] = useState('');

  const handlePost = async () => {
    await onCreatePost(newPost);
    setNewPost('');
  };

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, fontWeight: '600', fontSize: '15px', textAlign: 'center' }}>SafeSpace</div>

      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ff6b6b', flexShrink: 0 }} />
          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's happening?!" style={{ flex: 1, padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }} rows={2} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={handlePost} disabled={!newPost.trim()} style={{ padding: '8px 20px', backgroundColor: newPost.trim() ? '#0095f6' : '#ccc', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Post</button>
        </div>
      </div>

      <div>
        {posts.map((post) => (
          <div key={post.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ff6b6b' }} />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{post.userName}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>{new Date(post.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              {post.userId === user.uid && <button onClick={() => onDeletePost(post.id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '12px' }}>Delete</button>}
            </div>
            <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: 1.5 }}>{post.content}</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', color: '#999' }}>
              <button onClick={() => onLike(post.id)} style={{ background: 'none', border: 'none', color: likedPosts.includes(post.id) ? '#ed4956' : '#999', cursor: 'pointer', fontSize: '13px' }}>❤ {post.likes}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
