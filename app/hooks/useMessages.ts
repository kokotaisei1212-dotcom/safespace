import { useState, useCallback } from 'react';
import { Message } from '@/app/types';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  const sendMessage = useCallback(async (senderId: string, receiverId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      text,
      timestamp: Date.now(),
      read: false,
    };
    setMessages([...messages, newMessage]);
  }, [messages]);

  const getConversations = useCallback((userId: string) => {
    return conversations.filter(c => c.participants.includes(userId));
  }, [conversations]);

  return { messages, conversations, sendMessage, getConversations };
};
