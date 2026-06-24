import { User } from 'firebase/auth';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface CreatorDashboardProps {
  user: User;
  c: Colors;
  earnings: { total: number; monthly: number };
  followers: number;
  posts: number;
}

export default function CreatorDashboard({ user, c, earnings, followers, posts }: CreatorDashboardProps) {
  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}` }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Creator Studio</h1>
      </div>

      {/* Earnings Card */}
      <div style={{ padding: '16px', background: gradients.pink, color: '#fff', borderRadius: '12px', margin: '16px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', opacity: 0.9 }}>Total Earnings</p>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '36px', fontWeight: '700' }}>${earnings.total}</h2>
        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>This month: ${earnings.monthly}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '16px' }}>
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Followers</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700' }}>{followers}</p>
        </div>
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Posts</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700' }}>{posts}</p>
        </div>
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Engagement</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700' }}>4.2%</p>
        </div>
      </div>

      {/* Monetization Options */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Monetization</h3>

        <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>💰 Enable Tips</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Allow fans to send you tips (85% to you)</p>
        </div>

        <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>🔒 Exclusive Content</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Set subscription price (80% to you)</p>
        </div>

        <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>🎥 Live Streaming</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Go live with gifts & tips (90% to you)</p>
        </div>

        <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>🛍️ Merch Store</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Sell digital or physical products</p>
        </div>
      </div>

      {/* Payout Settings */}
      <div style={{ padding: '16px', borderTop: `1px solid ${c.border}` }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Payouts</h3>
        <button style={{ width: '100%', padding: '12px', backgroundColor: '#0095f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' }}>Connect Stripe Account</button>
        <button style={{ width: '100%', padding: '12px', backgroundColor: c.button, color: c.text, border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Request Payout</button>
      </div>
    </div>
  );
}
