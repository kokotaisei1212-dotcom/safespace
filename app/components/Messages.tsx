import { useState } from 'react';
import { Colors } from '@/app/types';
import { gradients } from '@/app/utils/theme';

interface MessagesProps {
  c: Colors;
}

export default function Messages({ c }: MessagesProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [hoverId, setHoverId] = useState<string | null>(null);

  const conversations = [
    { id: '1', name: 'Emma', avatar: '👩', lastMessage: 'Hey! How are you?' },
    { id: '2', name: 'Sophia', avatar: '👩', lastMessage: 'Let\'s grab coffee?' },
    { id: '3', name: 'Olivia', avatar: '👩', lastMessage: 'Love your post!' },
  ];

  return (
    <div style={{ maxWidth: '468px', margin: '0 auto', backgroundColor: c.bg, color: c.text, minHeight: '100vh', borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Messages</h2>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✏️</button>
      </div>

      {!selectedChat ? (
        /* Conversations List */
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => setSelectedChat(conv.id)}
              onMouseEnter={() => setHoverId(conv.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{ 
                padding: '12px 16px', 
                borderBottom: `1px solid ${c.border}`, 
                display: 'flex', 
                gap: '12px', 
                cursor: 'pointer',
                backgroundColor: hoverId === conv.id ? c.button : 'transparent',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: gradients.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{conv.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>{conv.name}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>{conv.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Chat View */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSelectedChat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>←</button>
            <p style={{ margin: 0, fontWeight: '600' }}>Emma</p>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: c.button, padding: '12px', borderRadius: '12px', maxWidth: '70%', wordBreak: 'break-word' }}>Hey! How are you?</div>
            <div style={{ backgroundColor: c.accent, color: '#fff', padding: '12px', borderRadius: '12px', maxWidth: '70%', marginLeft: 'auto', wordBreak: 'break-word' }}>I'm doing great! 💕</div>
          </div>
          <div style={{ padding: '16px', borderTop: `1px solid ${c.border}`, display: 'flex', gap: '8px' }}>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message..." style={{ flex: 1, padding: '10px', backgroundColor: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: '20px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            <button style={{ background: gradients.pink, color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: '600' }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
