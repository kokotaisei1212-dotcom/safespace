import { Colors } from '@/app/types';

interface SearchProps {
  c: Colors;
  onViewUser: () => void;
}

export default function Search({ c, onViewUser }: SearchProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <input type="text" placeholder="Search..." style={{ width: '100%', padding: '12px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
        <p>Search results coming soon</p>
      </div>
    </div>
  );
}
