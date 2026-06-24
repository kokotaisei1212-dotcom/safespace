import { useState } from 'react';
import { Colors, Message } from '@/app/types';
import { MessageIcon, SendIcon } from './Icons';
import { gradients } from '@/app/utils/theme';

interface MessagesProps {
  c: Colors;
}

export default function Messages({ c }: MessagesProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState([
    { id: '1', name: 'Sarah', lastMessage: 'Hey, how are you?', timestamp: Date.now() - 3600000 },
    { id: '2', name: 'Emma', lastMessage: 'Love your posts!', timestamp: Date.now() - 7200000 },
    { id: '3', name: 'Lisa', lastMessage: 'See you soon!', timestamp: Date.now() - 86400000 },
  ]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      receiverId: selectedChat,
      text: messageInput,
      timestamp: Date.now(),
      read: false,
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  return (
    <div style={{ 
      maxWidth: '468px', 
      margin: '0 auto', 
      backgroundColor: c.bg, 
      color: c.text, 
      minHeight: '100vh',
      borderLeft: `1px solid ${c.border}`,
      borderRight: `1px solid ${c.border}`,
      paddingBottom: '80px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div style={{ 
            padding: '16px',
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'sticky',
            top: 0,
            backgroundColor: c.bg,
            zIndex: 100
          }}>
            <button
              onClick={() => setSelectedChat(null)}
              style={{ background: 'none', border: 'none', color: c.text, cursor: 'pointer', fontSize: '16px', padding: 0 }}
            >
              Back
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: gradients.pink }} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>
                {conversations.find(c => c.id === selectedChat)?.name}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', fontSize: '12px', margin: 'auto' }}>
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.senderId === 'me' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '12px 16px',
                      backgroundColor: msg.senderId === 'me' ? '#0095f6' : c.input,
                      color: msg.senderId === 'me' ? '#fff' : c.text,
                      borderRadius: '18px',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div style={{ 
            padding: '12px 16px', 
            borderTop: `1px solid ${c.border}`,
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message"
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: c.input,
                color: c.text,
                border: `1px solid ${c.border}`,
                borderRadius: '20px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                background: 'none',
                border: 'none',
                color: '#0095f6',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SendIcon size={20} />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div style={{ 
            padding: '16px',
            borderBottom: `1px solid ${c.border}`,
            position: 'sticky',
            top: 0,
            backgroundColor: c.bg,
            zIndex: 100
          }}>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Messages</h1>
          </div>

          {/* Conversations */}
          <div>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  color: c.text,
                  border: 'none',
                  borderBottom: `1px solid ${c.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: gradients.pink, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{conv.name}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMessage}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#999', flexShrink: 0 }}>2h</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
