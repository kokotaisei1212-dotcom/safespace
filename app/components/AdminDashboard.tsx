import { Colors } from '@/app/types';

interface AdminDashboardProps {
  c: Colors;
  totalRevenue: number;
  platformFees: number;
  activeUsers: number;
  activeCreators: number;
}

export default function AdminDashboard({ c, totalRevenue, platformFees, activeUsers, activeCreators }: AdminDashboardProps) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: c.bg, color: c.text, padding: '24px' }}>
      <h1 style={{ margin: '0 0 32px 0', fontSize: '32px', fontWeight: '700' }}>Admin Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: c.button, padding: '20px', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Total Revenue</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '700' }}>${totalRevenue}</p>
        </div>
        <div style={{ backgroundColor: c.button, padding: '20px', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Your Fees (15%)</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#0095f6' }}>${platformFees}</p>
        </div>
        <div style={{ backgroundColor: c.button, padding: '20px', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Active Users</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '700' }}>{activeUsers}</p>
        </div>
        <div style={{ backgroundColor: c.button, padding: '20px', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Active Creators</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '32px', fontWeight: '700' }}>{activeCreators}</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div style={{ backgroundColor: c.button, padding: '20px', borderRadius: '12px' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Revenue Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Tips (15% fee)</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '700' }}>${Math.round(totalRevenue * 0.15)}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Subscriptions (20% fee)</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '700' }}>${Math.round(totalRevenue * 0.20)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
