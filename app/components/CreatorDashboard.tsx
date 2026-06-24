import { useState } from 'react';
import { UserProfile, Colors } from '@/app/types';

interface CreatorDashboardProps {
  profile: UserProfile | null;
  c: Colors;
}

export default function CreatorDashboard({ profile, c }: CreatorDashboardProps) {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  if (!profile?.isCreator) {
    return (
      <div style={{ 
        maxWidth: '468px', 
        margin: '0 auto', 
        backgroundColor: c.bg, 
        color: c.text, 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Not a Creator</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>Apply to become a creator to earn money</p>
        </div>
      </div>
    );
  }

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
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Creator Dashboard</h1>
      </div>

      {/* Earnings */}
      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase' }}>Earnings</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '16px', backgroundColor: c.input, borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>This Month</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '600' }}>${profile.monthlyEarnings}</p>
          </div>
          <div style={{ padding: '16px', backgroundColor: c.input, borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Total</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: '600' }}>${profile.totalEarnings}</p>
          </div>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0095f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Request Payout
        </button>
      </div>

      {/* Analytics */}
      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '600', color: '#999', textTransform: 'uppercase' }}>Analytics</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ padding: '12px', backgroundColor: c.input, borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>1.2k</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Followers</p>
          </div>
          <div style={{ padding: '12px', backgroundColor: c.input, borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>45</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Posts</p>
          </div>
          <div style={{ padding: '12px', backgroundColor: c.input, borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>8.5%</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>Engagement</p>
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: c.bg, color: c.text, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Bank Information</h2>
            
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank Name"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account Number"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowPayoutModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: c.button,
                  color: c.text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#0095f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
