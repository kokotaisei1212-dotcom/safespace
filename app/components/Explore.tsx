import { Colors } from '@/app/types';

interface ExploreProps {
  c: Colors;
}

export default function Explore({ c }: ExploreProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Explore</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', padding: '2px' }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{ paddingBottom: '100%', position: 'relative', backgroundColor: c.button, borderRadius: '0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {i % 3 === 0 ? '📷' : i % 3 === 1 ? '🎥' : '✨'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
