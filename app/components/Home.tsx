import { useState } from 'react';
import { User } from 'firebase/auth';
import { Post, UserProfile, Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface HomeProps {
  user: User;
  posts: Post[];
  profile: UserProfile | null;
  c: Colors;
  onCreatePost: (content: string, image?: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  likedPosts: string[];
}

export default function Home({ user, posts, profile, c, onCreatePost, onDeletePost, onLike, onComment, likedPosts }: HomeProps) {
  const [newPost, setNewPost] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePost = async () => {
    await onCreatePost(newPost);
    setNewPost('');
    setShowCreateModal(false);
  };

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 10 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, background: gradients.pink, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>❤️</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>💬</button>
        </div>
      </div>

      {/* Stories */}
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${c.border}`, overflowX: 'auto', display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ width: '56px', height: '56px', borderRadius: '50%', background: gradients.pink, padding: '2px', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👩</div>
          </div>
        ))}
      </div>

      {/* Create Post Button */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: gradients.pink }} />
        <button onClick={() => setShowCreateModal(true)} style={{ flex: 1, padding: '12px', backgroundColor: c.input, color: '#999', border: `1px solid ${c.border}`, borderRadius: '20px', textAlign: 'left', fontSize: '14px', cursor: 'pointer' }}>What's on your mind?</button>
        <button style={{ background: gradients.pink, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}>+</button>
      </div>

      {/* Posts Feed */}
      <div>
        {posts.map((post) => (
          <div key={post.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            {/* Post Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: gradients.pink }} />
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{post.userName}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>now</p>
                </div>
              </div>
              {post.userId === user.uid && <button onClick={() => onDeletePost(post.id)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>⋯</button>}
            </div>

            {/* Post Content */}
            <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: 1.5 }}>{post.content}</p>

            {/* Post Image */}
            {post.image && <div style={{ width: '100%', height: '300px', backgroundColor: c.input, borderRadius: '8px', marginBottom: '12px', background: gradients.rainbow }} />}

            {/* Hashtags */}
            {post.hashtags.length > 0 && <p style={{ margin: '8px 0', fontSize: '12px', color: '#0095f6' }}>{post.hashtags.map(tag => `#${tag}`).join(' ')}</p>}

            {/* Engagement */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', color: '#999', paddingBottom: '12px', borderBottom: `1px solid ${c.border}` }}>
              <button onClick={() => onLike(post.id)} style={{ background: 'none', border: 'none', color: likedPosts.includes(post.id) ? c.accent : '#999', cursor: 'pointer', fontSize: '13px' }}>❤️ {post.likes}</button>
              <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px' }}>💬 {post.comments.length}</button>
              <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px' }}>📤 {post.shares}</button>
            </div>

            {/* Comments Preview */}
            {post.comments.slice(0, 2).map((c) => (
              <p key={c.timestamp} style={{ margin: '8px 0', fontSize: '12px' }}><strong>{c.userName}</strong> {c.text}</p>
            ))}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: c.bg, color: c.text, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0' }}>Create a Post</h2>
            <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '8px', fontSize: '14px', minHeight: '120px', marginBottom: '16px', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePost} style={{ flex: 1, padding: '10px', background: gradients.pink, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
