import { useState } from 'react';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface TipModalProps {
  c: Colors;
  creatorName: string;
  onClose: () => void;
  onSend: (amount: number) => void;
}

export default function TipModal({ c, creatorName, onClose, onSend }: TipModalProps) {
  const [amount, setAmount] = useState(5);
  const presets = [1, 5, 10, 20, 50, 100];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div style={{ width: '100%', backgroundColor: c.bg, color: c.text, borderRadius: '16px 16px 0 0', padding: '24px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>Send a gift to {creatorName}</h2>

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
              }}
            >
              ${p}
            </button>
          ))}
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: c.input,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            marginBottom: '24px',
            outline: 'none',
            boxSizing: 'border-box',
            fontSize: '13px',
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: c.button,
              color: c.text,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(amount)}
            style={{
              flex: 1,
              padding: '12px',
              background: gradients.pink,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Send ${amount}
          </button>
        </div>
      </div>
    </div>
  );
}
