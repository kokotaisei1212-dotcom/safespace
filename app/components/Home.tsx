import { useState } from 'react';
import { User } from 'firebase/auth';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface HomeProps {
  user: User;
  c: Colors;
}

interface Post {
  id: string;
  content: string;
  timestamp: number;
  likes: number;
}

export default function Home({ user, c }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      content: newPost,
      timestamp: Date.now(),
      likes: 0,
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleEditPost = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setEditingPostId(id);
      setEditingContent(post.content);
    }
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim()) return;
    setPosts(posts.map((p) => (p.id === editingPostId ? { ...p, content: editingContent } : p)));
    setEditingPostId(null);
    setEditingContent('');
  };

  const handleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    newLiked.has(id) ? newLiked.delete(id) : newLiked.add(id);
    setLikedPosts(newLiked);
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: likedPosts.has(id) ? p.likes - 1 : p.likes + 1 } : p)));
  };

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '300', fontStyle: 'italic', margin: 0, background: gradients.pink, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
      </div>

      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: gradients.pink, flexShrink: 0 }} />
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              minHeight: '60px',
            }}
          />
        </div>
        <button
          onClick={handleCreatePost}
          disabled={!newPost.trim()}
          style={{
            marginLeft: 'auto',
            display: 'block',
            padding: '8px 20px',
            background: gradients.pink,
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: newPost.trim() ? 'pointer' : 'not-allowed',
            opacity: newPost.trim() ? 1 : 0.5,
          }}
        >
          Post
        </button>
      </div>

      <div>
        {posts.map((post) => (
          <div key={post.id} style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: gradients.pink, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>{user.email?.split('@')[0]}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#999' }}>{new Date(post.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditPost(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: c.text,
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px 8px',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4458',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px 8px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editingPostId === post.id ? (
                  <div style={{ marginTop: '8px' }}>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: c.input,
                        color: c.text,
                        border: `1px solid ${c.border}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                        resize: 'none',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '8px',
                        minHeight: '50px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: '#ff1493',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPostId(null)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: c.input,
                          color: c.text,
                          border: `1px solid ${c.border}`,
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '8px 0', fontSize: '13px', lineHeight: 1.5 }}>{post.content}</p>
                )}

                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#999', marginTop: '8px' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: likedPosts.has(post.id) ? '#ff1493' : '#999',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Like {post.likes}
                  </button>
                  <span>Comment</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
