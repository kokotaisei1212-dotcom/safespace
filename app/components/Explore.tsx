import { Colors } from '@/app/types';

interface ExploreProps {
  c: Colors;
}

export default function Explore({ c }: ExploreProps) {
  const posts = Array(12).fill(0).map((_, i) => ({ id: i, views: Math.floor(Math.random() * 100000) }));

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
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Explore</h1>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', padding: '2px' }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              aspectRatio: '1',
              backgroundColor: c.button,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '11px', color: '#fff', fontWeight: '600' }}>
              {post.views.toLocaleString()} views
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
