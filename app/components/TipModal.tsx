import { useState } from 'react';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface TipModalProps {
  c: Colors;
  creatorName: string;
  onClose: () => void;
  onSend: (amount: number) => Promise<void>;
}

export default function TipModal({ c, creatorName, onClose, onSend }: TipModalProps) {
  const [amount, setAmount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const presets = [1, 5, 10, 20, 50, 100];
  const fee = Math.ceil(amount * 0.15);
  const net = amount - fee;

  const handleSend = async () => {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await onSend(amount);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send tip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div style={{ width: '100%', backgroundColor: c.bg, color: c.text, borderRadius: '16px 16px 0 0', padding: '24px' }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '24px' }}>check_circle</p>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Sent</h2>
            <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>Your tip was sent to {creatorName}</p>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Send a gift to {creatorName}</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '12px', color: '#999' }}>You'll be charged ${amount}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  style={{
                    padding: '12px',
                    backgroundColor: amount === p ? '#ff1493' : c.input,
                    color: amount === p ? '#fff' : c.text,
                    border: `1px solid ${amount === p ? '#ff1493' : c.border}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ${p}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                marginBottom: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                fontSize: '13px',
              }}
            />

            <div style={{ backgroundColor: c.input, padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <span>${amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#999' }}>
                <span>SafeSpace fee (15%)</span>
                <span>-${fee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${c.border}`, fontWeight: '600' }}>
                <span>Creator receives</span>
                <span>${net}</span>
              </div>
            </div>

            {error && <p style={{ margin: '0 0 16px 0', color: '#ff4458', fontSize: '12px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: c.button,
                  color: c.text,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: gradients.pink,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? 'Sending...' : `Send $${amount}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
