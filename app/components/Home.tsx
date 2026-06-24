import { User } from 'firebase/auth';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface HomeProps {
  user: User;
  c: Colors;
}

export default function Home({ user, c }: HomeProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, position: 'sticky', top: 0, backgroundColor: c.bg, zIndex: 100 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '300', fontStyle: 'italic', margin: 0, background: gradients.pink, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SafeSpace</h1>
      </div>

      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        <p>Feed coming soon</p>
      </div>
    </div>
  );
}
