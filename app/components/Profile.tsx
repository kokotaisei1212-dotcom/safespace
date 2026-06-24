import { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, Post, Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';
import { UserIcon } from './Icons';

interface ProfileProps {
  user: User;
  displayProfile: UserProfile | null;
  posts: Post[];
  following: string[];
  c: Colors;
  isViewingOther: boolean;
  onFollow: (userId: string) => void;
}

export default function Profile({ user, displayProfile, posts, following, c, isViewingOther, onFollow }: ProfileProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(displayProfile?.name || '');
  const [editBio, setEditBio] = useState(displayProfile?.bio || '');
  const [editWebsite, setEditWebsite] = useState(displayProfile?.website || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  if (!displayProfile) {
    return <div style={{ padding: '24px', textAlign: 'center', color: c.text }}>Loading profile...</div>;
  }

  const handleEditProfile = () => {
    setEditError('');
    setEditSuccess('');
    
    if (!editName.trim()) {
      setEditError('Name cannot be empty');
      return;
    }
    
    setEditSuccess('Profile updated successfully');
    setShowEditModal(false);
  };

  const userPosts = posts.filter(p => p.userId === displayProfile.id);
  const isOwnProfile = user.uid === displayProfile.id;

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
      <div style={{ 
        padding: '16px',
        borderBottom: `1px solid ${c.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: c.bg,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>@{displayProfile.username}</h1>
      </div>

      <div style={{ padding: '24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <div style={{ width: '77px', height: '77px', borderRadius: '50%', background: gradients.pink, flexShrink: 0 }} />
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px', textAlign: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{userPosts.length}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Posts</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{displayProfile.followers?.length || 0}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Followers</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{displayProfile.following?.length || 0}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>Following</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: c.input,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Edit Profile
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: c.input,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Share
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onFollow(displayProfile.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: following.includes(displayProfile.id) ? c.input : '#0095f6',
                      color: following.includes(displayProfile.id) ? c.text : '#fff',
                      border: `1px solid ${following.includes(displayProfile.id) ? c.border : '#0095f6'}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {following.includes(displayProfile.id) ? 'Following' : 'Follow'}
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: c.input,
                      color: c.text,
                      border: `1px solid ${c.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600' }}>
          {displayProfile.name}
          {displayProfile.verified && ' V'}
          {displayProfile.isCreator && ' Creator'}
        </p>

        <p style={{ margin: '4px 0', fontSize: '13px', color: '#999' }}>{displayProfile.bio}</p>

        {displayProfile.website && (
          <a href={displayProfile.website} target="_blank" rel="noopener noreferrer" style={{ margin: '4px 0', fontSize: '13px', color: '#0095f6', textDecoration: 'none' }}>
            {displayProfile.website}
          </a>
        )}

        {displayProfile.isCreator && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: c.input, borderRadius: '8px', fontSize: '12px' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Creator Stats</p>
            <p style={{ margin: '0', color: '#999' }}>Monthly: ${displayProfile.monthlyEarnings}</p>
            <p style={{ margin: '4px 0 0 0', color: '#999' }}>Total: ${displayProfile.totalEarnings}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', padding: '2px' }}>
        {userPosts.map((post) => (
          <div key={post.id} style={{ aspectRatio: '1', backgroundColor: c.button, cursor: 'pointer' }} />
        ))}
      </div>

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: c.bg, color: c.text, borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Edit Profile</h2>
            
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
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
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Bio"
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
                marginBottom: '12px',
              }}
            />
            
            <input
              type="url"
              value={editWebsite}
              onChange={(e) => setEditWebsite(e.target.value)}
              placeholder="Website"
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

            {editError && <p style={{ margin: '12px 0', color: '#ff4458', fontSize: '12px' }}>{editError}</p>}
            {editSuccess && <p style={{ margin: '12px 0', color: '#0095f6', fontSize: '12px' }}>{editSuccess}</p>}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowEditModal(false)}
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
                onClick={handleEditProfile}
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
