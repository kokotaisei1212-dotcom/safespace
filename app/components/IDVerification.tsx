import { useState } from 'react';
import { Colors } from '@/app/types';

interface IDVerificationProps {
  c: Colors;
  onVerified: (verified: boolean) => void;
}

export default function IDVerification({ c, onVerified }: IDVerificationProps) {
  const [step, setStep] = useState<'gender' | 'upload' | 'confirmed'>('gender');
  const [selectedGender, setSelectedGender] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);

  const handleGenderSelect = (gender: string) => {
    if (gender === 'female') {
      setSelectedGender(gender);
      setStep('upload');
    }
  };

  const handleVerify = () => {
    if (idUploaded) {
      setStep('confirmed');
      onVerified(true);
    }
  };

  return (
    <div style={{ 
      maxWidth: '468px', 
      margin: '0 auto', 
      backgroundColor: c.bg, 
      color: c.text, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {step === 'gender' && (
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>SafeSpace</h1>
          <p style={{ margin: '0 0 32px 0', fontSize: '13px', color: '#999' }}>Women-only community</p>

          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Verify your gender</h2>
          
          <button
            onClick={() => handleGenderSelect('female')}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.input)}
          >
            Female
          </button>

          <button
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: c.button,
              color: '#999',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          >
            Other (not available)
          </button>
        </div>
      )}

      {step === 'upload' && (
        <div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Verify your identity</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#999' }}>Upload a valid government ID (passport, driver's license, or national ID)</p>

          <div
            style={{
              padding: '40px 24px',
              backgroundColor: c.input,
              border: `2px dashed ${c.border}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = c.button)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = c.input)}
            onClick={() => setIdUploaded(true)}
          >
            <p style={{ margin: 0, fontSize: '32px', marginBottom: '8px' }}>camera</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Upload or take a photo</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>JPG, PNG or PDF</p>
          </div>

          {idUploaded && (
            <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              document_scan.jpg ✓
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={!idUploaded}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: idUploaded ? '#ff1493' : '#999',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: idUploaded ? 'pointer' : 'not-allowed',
            }}
          >
            Verify
          </button>
        </div>
      )}

      {step === 'confirmed' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '24px' }}>check_circle</p>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Verified!</h2>
          <p style={{ margin: '0 0 32px 0', fontSize: '13px', color: '#999' }}>Welcome to SafeSpace</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ff1493',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
