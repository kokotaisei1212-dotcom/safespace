import { useState } from 'react';
import { Colors, Transaction, UserProfile } from '@/app/types';

interface AdminDashboardProps {
  c: Colors;
  transactions: Transaction[];
  users: UserProfile[];
}

export default function AdminDashboard({ c, transactions = [], users = [] }: AdminDashboardProps) {
  const [tab, setTab] = useState<'overview' | 'transactions' | 'users'>('overview');

  const totalRevenue = transactions.reduce((sum, t) => sum + t.fee, 0);
  const totalUsers = users.length;
  const totalTransactions = transactions.length;
  const pendingPayouts = transactions.filter(t => t.status === 'pending').length;

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
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${c.border}` }}>
        {(['overview', 'transactions', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'transparent',
              color: tab === t ? c.text : '#999',
              border: 'none',
              borderBottom: tab === t ? `2px solid ${c.text}` : 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div style={{ padding: '24px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: c.input, borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Total Revenue</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '600' }}>${totalRevenue.toFixed(2)}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: c.input, borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Total Users</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '600' }}>{totalUsers}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: c.input, borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Transactions</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '600' }}>{totalTransactions}</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: c.input, borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Pending Payouts</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '600' }}>{pendingPayouts}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div>
          {transactions.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
              No transactions yet
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>${tx.amount}</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: tx.status === 'completed' ? '#0095f6' : '#999', color: '#fff', borderRadius: '4px' }}>
                    {tx.status}
                  </span>
                </div>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>Fee: ${tx.fee.toFixed(2)}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>
                  {new Date(tx.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          {users.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
              No users yet
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}` }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{user.name}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>@{user.username}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {user.isCreator && <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#0095f6', color: '#fff', borderRadius: '4px' }}>Creator</span>}
                  {user.verified && <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#ffd700', color: '#000', borderRadius: '4px' }}>Verified</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
