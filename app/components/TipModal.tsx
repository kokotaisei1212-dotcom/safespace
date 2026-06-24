import { useState } from 'react';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface TipModalProps {
  c: Colors;
  creatorName: string;
  onSendTip: (amount: number) => void;
  onClose: () => void;
}

export default function TipModal({ c, creatorName, onSendTip, onClose }: TipModalProps) {
  const [amount, setAmount] = useState(5);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [step, setStep] = useState<'amount' | 'payment' | 'confirm'>('amount');

  const presets = [1, 5, 10, 20, 50, 100];
  const fee = Math.round(amount * 0.15);
  const net = amount - fee;

  const handleContinue = () => {
    setStep('payment');
  };

  const handleConfirm = async () => {
    setStep('confirm');
    await onSendTip(amount);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div style={{ width: '100%', backgroundColor: c.bg, color: c.text, borderRadius: '16px 16px 0 0', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>

        {step === 'amount' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700' }}>Send a Tip to {creatorName}</h2>

            {/* Preset Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  style={{
                    padding: '12px',
                    backgroundColor: amount === preset ? c.accent : c.button,
                    color: amount === preset ? '#fff' : c.text,
                    border: `2px solid ${amount === preset ? c.accent : c.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', color: '#999' }}>Custom Amount</label>
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
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  marginTop: '8px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Fee Breakdown */}
            <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Amount:</span>
                <strong>${amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#999' }}>
                <span>Platform Fee (15%):</span>
                <span>${fee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${c.border}` }}>
                <strong>{creatorName} receives:</strong>
                <strong style={{ color: c.accent }}>${net}</strong>
              </div>
            </div>

            <button
              onClick={handleContinue}
              style={{
                width: '100%',
                padding: '12px',
                background: gradients.pink,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700' }}>Payment Method</h2>

            {/* Payment Methods */}
            <div style={{ marginBottom: '24px' }}>
              {['card', 'apple_pay', 'google_pay'].map((method) => (
                <div
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedMethod === method ? c.accent : c.button,
                    color: selectedMethod === method ? '#fff' : c.text,
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>
                    {method === 'card' ? '💳' : method === 'apple_pay' ? '🍎' : '🔵'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>
                    {method === 'card' ? 'Credit/Debit Card' : method === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Payment Method */}
            {selectedMethod === 'card' && (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Card Number"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: c.input,
                    color: c.text,
                    border: `1px solid ${c.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    marginBottom: '8px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: c.input,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: c.input,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setStep('amount')}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: c.button,
                  color: c.text,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: gradients.pink,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Send ${amount}
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <h2 style={{ margin: '0 0 8px 0' }}>Thank you!</h2>
            <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
              You sent ${amount} to {creatorName}
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                background: gradients.pink,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
