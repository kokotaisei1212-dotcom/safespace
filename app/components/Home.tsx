import { useState } from 'react';
import { User } from 'firebase/auth';
import { Post, Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';
import { HeartIcon, ChatIcon, SendIcon, GiftIcon, MoreIcon, HomeIcon } from './Icons';

interface HomeProps {
  user: User;
  posts: Post[];
  c: Colors;
  onCreatePost: (content: string) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onLike: (postId: string) => void;
  onTip: (postId: string, creatorId: string) => void;
  likedPosts: string[];
}

export default function Home({ user, posts, c, onCreatePost, onDeletePost, onLike, onTip, likedPosts }: HomeProps) {
  const [newPost, setNewPost] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    try {
      await onCreatePost(newPost);
      setNewPost('');
      setShowModal(false);
    } catch (error) {
      console.error('Post failed:', error);
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: c.bg,
        zIndex: 100
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '300',
          margin: 0,
          fontStyle: 'italic',
          background: gradients.pink,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SafeSpace
        </h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartIcon size={20} />
          </button>
          <button style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChatIcon size={20} />
          </button>
        </div>
      </div>

      {/* Stories */}
      <div style={{ 
        padding: '16px',
        borderBottom: `1px solid ${c.border}`,
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        scrollBehavior: 'smooth'
      }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: gradients.pink,
              padding: '2px',
              flexShrink: 0,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%',
              backgroundColor: c.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {i === 1 ? '+' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div>
        {posts.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            No posts yet
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ borderBottom: `1px solid ${c.border}` }}>
              {/* Post Header */}
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: gradients.pink }} />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '500' }}>{post.userName}</p>
                </div>
                {post.userId === user.uid && (
                  <button 
                    onClick={() => {
                      if (confirm('Delete post?')) {
                        onDeletePost(post.id);
                      }
                    }}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: c.text, 
                      cursor: 'pointer', 
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MoreIcon size={18} />
                  </button>
                )}
              </div>

              {/* Post Image */}
              <div style={{ width: '100%', aspectRatio: '1', backgroundColor: c.button }} />

              {/* Engagement Buttons */}
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    onClick={() => onLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: likedPosts.includes(post.id) ? '#ff1493' : c.text,
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s',
                    }}
                  >
                    <HeartIcon filled={likedPosts.includes(post.id)} size={20} />
                  </button>
                  <button style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChatIcon size={20} />
                  </button>
                  <button style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SendIcon size={20} />
                  </button>
                </div>
                <button
                  onClick={() => onTip(post.id, post.userId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: c.text,
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <GiftIcon size={20} />
                </button>
              </div>

              {/* Likes */}
              <div style={{ padding: '0 16px 12px 16px', fontSize: '13px', fontWeight: '600' }}>
                {post.likes} likes
              </div>

              {/* Caption */}
              <div style={{ padding: '0 16px 8px 16px', fontSize: '13px', lineHeight: 1.4 }}>
                <span style={{ fontWeight: '600' }}>{post.userName}</span> {post.content}
              </div>

              {/* Comments */}
              <div style={{ padding: '0 16px 12px 16px', fontSize: '12px', color: '#999' }}>
                View all {post.comments.length} comments
              </div>

              {/* Time */}
              <div style={{ padding: '0 16px 12px 16px', fontSize: '11px', color: '#999', textTransform: 'uppercase' }}>
                2 hours ago
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: c.bg, color: c.text, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Create post</h2>
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
                minHeight: '100px',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: c.button,
                  color: c.text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#ff1493',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: newPost.trim() && !isPosting ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  fontSize: '13px',
                  opacity: !newPost.trim() || isPosting ? 0.5 : 1,
                }}
              >
                {isPosting ? 'Posting...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: gradients.pink,
          color: '#fff',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        +
      </button>
    </div>
  );
}
