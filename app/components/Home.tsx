import { useState } from 'react';
import { User } from 'firebase/auth';
import { Post, UserProfile, Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface HomeProps {
  user: User;
  posts: Post[];
  profile: UserProfile | null;
  c: Colors;
  onCreatePost: (content: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  likedPosts: string[];
}

export default function Home({ 
  user, 
  posts, 
  profile, 
  c, 
  onCreatePost, 
  onDeletePost, 
  onLike, 
  onComment, 
  likedPosts 
}: HomeProps) {
  const [newPost, setNewPost] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    try {
      await onCreatePost(newPost);
      setNewPost('');
      setShowCreateModal(false);
    } finally {
      setIsPosting(false);
    }
  };

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
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: `1px solid ${c.border}`, 
        position: 'sticky', 
        top: 0, 
        backgroundColor: c.bg, 
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          margin: 0,
          background: gradients.pink,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          SafeSpace
        </h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', color: c.text, fontSize: '16px', cursor: 'pointer', padding: 0 }}>heart</button>
          <button style={{ background: 'none', border: 'none', color: c.text, fontSize: '16px', cursor: 'pointer', padding: 0 }}>chat</button>
        </div>
      </div>

      {/* Create Post Button */}
      <div style={{ 
        padding: '16px', 
        borderBottom: `1px solid ${c.border}`,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          background: gradients.pink,
          flexShrink: 0
        }} />
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: c.input,
            color: '#999',
            border: `1px solid ${c.border}`,
            borderRadius: '20px',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.input)}
        >
          What's happening?
        </button>
      </div>

      {/* Posts Feed */}
      <div>
        {posts.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#999' }}>
            <p style={{ margin: 0, fontSize: '13px' }}>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div 
              key={post.id} 
              style={{ 
                padding: '16px', 
                borderBottom: `1px solid ${c.border}`,
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {/* Post Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: gradients.pink }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>{post.userName}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#999' }}>2h ago</p>
                  </div>
                </div>
                {post.userId === user.uid && (
                  <button
                    onClick={() => onDeletePost(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px 8px',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = c.text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
                  >
                    ...
                  </button>
                )}
              </div>

              {/* Post Content */}
              <p style={{ 
                margin: '8px 0', 
                fontSize: '13px', 
                lineHeight: 1.5,
                wordBreak: 'break-word'
              }}>
                {post.content}
              </p>

              {/* Engagement */}
              <div style={{ 
                display: 'flex', 
                gap: '24px', 
                marginTop: '12px', 
                fontSize: '12px', 
                color: '#999',
                paddingBottom: '12px',
                borderBottom: `1px solid ${c.border}`
              }}>
                <button
                  onClick={() => onLike(post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: likedPosts.includes(post.id) ? c.accent : '#999',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => !likedPosts.includes(post.id) && (e.currentTarget.style.color = c.text)}
                  onMouseLeave={(e) => !likedPosts.includes(post.id) && (e.currentTarget.style.color = '#999')}
                >
                  heart {post.likes}
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = c.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
                >
                  chat {post.comments.length}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: c.bg, 
            color: c.text, 
            borderRadius: '12px', 
            padding: '24px', 
            maxWidth: '400px', 
            width: '90%', 
            boxSizing: 'border-box'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Create a post</h2>
            
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                minHeight: '120px',
                marginBottom: '16px',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: c.button,
                  color: c.text,
                  border: `1px solid ${c.border}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.input)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.button)}
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: gradients.pink,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: !newPost.trim() || isPosting ? 'not-allowed' : 'pointer',
                  opacity: !newPost.trim() || isPosting ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {isPosting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
