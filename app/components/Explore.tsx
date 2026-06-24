import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface ExploreProps {
  c: Colors;
}

export default function Explore({ c }: ExploreProps) {
  const reels = [
    { id: '1', creator: 'Emma', title: 'Women in Tech 💻' },
    { id: '2', creator: 'Sophia', title: 'Lesbian Pride 🏳️‍🌈' },
    { id: '3', creator: 'Olivia', title: 'LGBTQ+ Love Stories ❤️' },
    { id: '4', creator: 'Maya', title: 'Women Empowerment 💪' },
  ];

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}` }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, textAlign: 'center', fontWeight: '600' }}>Explore</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', padding: '8px' }}>
        {reels.map((reel) => (
          <div key={reel.id} style={{ background: gradients.rainbow, borderRadius: '8px', padding: '2px', cursor: 'pointer' }}>
            <div style={{ backgroundColor: c.bg, borderRadius: '8px', padding: '24px', textAlign: 'center', minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
              <div style={{ fontSize: '32px' }}>🎬</div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>{reel.title}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>by {reel.creator}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
