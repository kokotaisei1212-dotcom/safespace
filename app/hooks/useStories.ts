import { useState, useCallback } from 'react';
import { Story } from '@/app/types';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);

  const createStory = useCallback(async (userId: string, userName: string, avatar: string, media: string) => {
    const story: Story = {
      id: Date.now().toString(),
      userId,
      userName,
      avatar,
      media,
      timestamp: Date.now(),
      viewed: false,
    };
    setStories([...stories, story]);
  }, [stories]);

  const viewStory = useCallback((storyId: string) => {
    setStories(stories.map(s => s.id === storyId ? { ...s, viewed: true } : s));
  }, [stories]);

  return { stories, createStory, viewStory };
};
