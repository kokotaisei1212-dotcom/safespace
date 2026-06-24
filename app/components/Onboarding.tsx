import { useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface OnboardingProps {
  user: User;
  c: Colors;
  onComplete: () => void;
}

export default function Onboarding({ user, c, onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'gender' | 'id' | 'profile' | 'photo'>('gender');
  const [selectedGender, setSelectedGender] = useState('');
  const [idType, setIdType] = useState<'passport' | 'license' | 'national-id'>('passport');
  const [idUploaded, setIdUploaded] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenderSelect = (gender: string) => {
    if (gender === 'female') {
      setSelectedGender(gender);
      setStep('id');
    }
  };

  const handleIDUpload = () => {
    if (idUploaded) {
      setStep('profile');
    }
  };

  const handleProfileComplete = () => {
    if (name.trim() && username.trim()) {
      setStep('photo');
    }
  };

  const handlePhotoUpload = () => {
    setPhotoUploaded(true);
    setTimeout(() => {
      onComplete();
    }, 500);
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
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '300',
          fontStyle: 'italic',
          margin: '0 0 8px 0',
          background: gradients.pink,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SafeSpace
        </h1>
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Women-only community</p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['gender', 'id', 'profile', 'photo'].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: ['gender', 'id', 'profile', 'photo'].indexOf(s) <= ['gender', 'id', 'profile', 'photo'].indexOf(step) ? '#ff1493' : c.border,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {/* Step 1: Gender */}
      {step === 'gender' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Verify your gender</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#999' }}>SafeSpace is for women only</p>

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
            disabled
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

      {/* Step 2: ID Upload */}
      {step === 'id' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Verify your identity</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#999' }}>Upload a valid government ID</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {(['passport', 'license', 'national-id'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setIdType(type)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: idType === type ? '#ff1493' : c.input,
                  color: idType === type ? '#fff' : c.text,
                  border: `1px solid ${idType === type ? '#ff1493' : c.border}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {type === 'passport' ? 'Passport' : type === 'license' ? 'License' : 'National ID'}
              </button>
            ))}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
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
          >
            <p style={{ margin: 0, fontSize: '32px', marginBottom: '8px' }}>camera</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Upload or take a photo</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>JPG, PNG or PDF</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={() => setIdUploaded(true)}
          />

          {idUploaded && (
            <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              document_scan.jpg check
            </div>
          )}

          <button
            onClick={handleIDUpload}
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

      {/* Step 3: Profile */}
      {step === 'profile' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Set up your profile</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#999' }}>Tell us about yourself</p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (no spaces)"
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

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio (optional)"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              minHeight: '80px',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '16px',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={handleProfileComplete}
            disabled={!name.trim() || !username.trim()}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: name.trim() && username.trim() ? '#ff1493' : '#999',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: name.trim() && username.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 4: Photo */}
      {step === 'photo' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>Add a profile photo</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#999' }}>Make your profile more personal</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '60px 24px',
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
          >
            <p style={{ margin: 0, fontSize: '32px', marginBottom: '8px' }}>image</p>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Upload a photo</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>or skip</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={() => setPhotoUploaded(true)}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePhotoUpload}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
            <button
              onClick={handlePhotoUpload}
              style={{
                flex: 1,
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
              {photoUploaded ? 'Done' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
