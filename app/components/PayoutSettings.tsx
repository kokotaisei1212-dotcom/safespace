import { useState } from 'react';
import { Colors } from '@/app/types';

interface PayoutSettingsProps {
  c: Colors;
  totalEarnings: number;
  pendingEarnings: number;
}

export default function PayoutSettings({ c, totalEarnings, pendingEarnings }: PayoutSettingsProps) {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    accountNumber: '',
    routingNumber: '',
    holderName: '',
  });

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, padding: '16px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700' }}>Payout Settings</h2>

      {/* Earnings Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Total Earned</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700' }}>${totalEarnings}</p>
        </div>
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Pending Payout</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: '700', color: '#0095f6' }}>${pendingEarnings}</p>
        </div>
      </div>

      {!stripeConnected ? (
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '13px', marginBottom: '12px' }}>Connect your Stripe account to receive payouts</p>
          <button
            onClick={() => setStripeConnected(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0095f6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Connect Stripe
          </button>
        </div>
      ) : (
        <div style={{ backgroundColor: c.button, padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Bank Account</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input
              type="text"
              placeholder="Account Number"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
              style={{
                padding: '10px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Routing Number"
              value={bankInfo.routingNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, routingNumber: e.target.value })}
              style={{
                padding: '10px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
          <input
            type="text"
            placeholder="Account Holder Name"
            value={bankInfo.holderName}
            onChange={(e) => setBankInfo({ ...bankInfo, holderName: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: '4px',
              fontSize: '12px',
              marginTop: '8px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Payout Schedule */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Payout Schedule</p>
        <select
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: c.input,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '4px',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option>Weekly (Minimum $20)</option>
          <option>Bi-weekly (Minimum $20)</option>
          <option>Monthly (Minimum $20)</option>
        </select>
      </div>

      {/* Request Payout */}
      <button
        disabled={pendingEarnings < 20}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: pendingEarnings >= 20 ? '#0095f6' : '#999',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: pendingEarnings >= 20 ? 'pointer' : 'not-allowed',
        }}
      >
        {pendingEarnings >= 20 ? 'Request Payout' : `Need $${20 - pendingEarnings} more`}
      </button>

      {/* Payout History */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${c.border}` }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>Recent Payouts</h3>
        <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#999' }}>
          <p style={{ margin: 0 }}>No payouts yet</p>
        </div>
      </div>
    </div>
  );
}
