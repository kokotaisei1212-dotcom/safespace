import { useState, useCallback } from 'react';
import { Story } from '@/app/types';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      // Firebase から stories を取得
      setStories([]);
    } catch (error) {
      console.error('Load stories error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (userId: string, image: string) => {
    try {
      const story: Story = {
        id: Date.now().toString(),
        userId,
        userName: 'User',
        avatar: '',
        image,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        viewed: false,
      };
      setStories([...stories, story]);
    } catch (error) {
      console.error('Create story error:', error);
    }
  }, [stories]);

  return { stories, loading, loadStories, createStory };
};
