import { Colors } from '@/app/types';

interface MessagesProps {
  c: Colors;
}

export default function Messages({ c }: MessagesProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Messages</h2>
      </div>
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        <p>No messages yet</p>
      </div>
    </div>
  );
}
