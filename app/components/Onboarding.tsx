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
  const [idType, setIdType] = useState<'passport' | 'license' | 'national-id'>('license');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idError, setIdError] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateIDFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!validTypes.includes(file.type)) {
      setIdError('Only JPG, PNG, or PDF allowed');
      return false;
    }

    if (file.size > maxSize) {
      setIdError('File too large (max 5MB)');
      return false;
    }

    setIdError('');
    return true;
  };

  const handleGenderSelect = (gender: string) => {
    if (gender === 'female') {
      setSelectedGender(gender);
      setStep('id');
    }
  };

  const handleIDUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (validateIDFile(file)) {
      setIdFile(file);
    }
  };

  const handleIDVerify = () => {
    if (!idFile) {
      setIdError('File required');
      return;
    }
    setStep('profile');
  };

  const handleProfileComplete = () => {
    if (name.trim().length < 2) {
      return;
    }
    if (username.trim().length < 3) {
      return;
    }
    setStep('photo');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleComplete = () => {
    onComplete();
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
        <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Women-only</p>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {['gender', 'id', 'profile', 'photo'].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '3px',
              backgroundColor: ['gender', 'id', 'profile', 'photo'].indexOf(s) <= ['gender', 'id', 'profile', 'photo'].indexOf(step) ? '#ff1493' : c.border,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>

      {step === 'gender' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Verify gender</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '12px', color: '#999' }}>SafeSpace is for women only</p>

          <button
            onClick={() => handleGenderSelect('female')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            Female
          </button>

          <button
            disabled
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.button,
              color: '#999',
              border: `1px solid ${c.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'not-allowed',
              opacity: 0.5,
            }}
          >
            Other (not available)
          </button>
        </div>
      )}

      {step === 'id' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>ID verification</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#999' }}>Government ID required</p>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
            {(['passport', 'license', 'national-id'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setIdType(type)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: idType === type ? '#ff1493' : c.input,
                  color: idType === type ? '#fff' : c.text,
                  border: `1px solid ${idType === type ? '#ff1493' : c.border}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {type === 'passport' ? 'Passport' : type === 'license' ? 'License' : 'ID'}
              </button>
            ))}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '40px 24px',
              backgroundColor: c.input,
              border: `2px dashed ${idFile ? '#ff1493' : c.border}`,
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            <p style={{ margin: 0, fontSize: '28px', marginBottom: '8px' }}>camera</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Upload</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>JPG, PNG or PDF</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,.pdf"
            onChange={handleIDUpload}
            style={{ display: 'none' }}
          />

          {idFile && <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#0095f6' }}>check {idFile.name}</p>}
          {idError && <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#ff4458' }}>{idError}</p>}

          <button
            onClick={handleIDVerify}
            disabled={!idFile}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: idFile ? '#ff1493' : '#999',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: idFile ? 'pointer' : 'not-allowed',
            }}
          >
            Verify
          </button>
        </div>
      )}

      {step === 'profile' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Profile</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#999' }}>About yourself</p>

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
              border: `1px solid ${name.trim().length < 2 && name ? '#ff4458' : c.border}`,
              borderRadius: '4px',
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
            placeholder="Username"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: c.input,
              color: c.text,
              border: `1px solid ${username.trim().length < 3 && username ? '#ff4458' : c.border}`,
              borderRadius: '4px',
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
              borderRadius: '4px',
              fontSize: '13px',
              minHeight: '60px',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '16px',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={handleProfileComplete}
            disabled={name.trim().length < 2 || username.trim().length < 3}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: name.trim().length >= 2 && username.trim().length >= 3 ? '#ff1493' : '#999',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: name.trim().length >= 2 && username.trim().length >= 3 ? 'pointer' : 'not-allowed',
            }}
          >
            Next
          </button>
        </div>
      )}

      {step === 'photo' && (
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Photo</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#999' }}>Optional</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '50px 24px',
              backgroundColor: c.input,
              border: `2px dashed ${photoFile ? '#ff1493' : c.border}`,
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            <p style={{ margin: 0, fontSize: '28px', marginBottom: '8px' }}>image</p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600' }}>Upload photo</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleComplete}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
            <button
              onClick={handleComplete}
              style={{
                flex: 1,
                padding: '12px',
                background: gradients.pink,
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
