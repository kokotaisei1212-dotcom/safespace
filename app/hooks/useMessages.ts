import { useState, useCallback } from 'react';
import { Message, Conversation } from '@/app/types';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async (userId: string, targetId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/get?senderId=${userId}&receiverId=${targetId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (senderId: string, receiverId: string, text: string) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, text }),
      });
      const data = await response.json();
      setMessages([...messages, data]);
    } catch (error) {
      console.error('Send message error:', error);
    }
  }, [messages]);

  return { messages, conversations, loading, loadMessages, sendMessage };
};
