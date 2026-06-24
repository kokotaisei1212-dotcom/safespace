import { Colors, Theme } from '@/app/types';

export const getColors = (theme: Theme): Colors => {
  return theme === 'dark'
    ? { bg: '#000', text: '#fff', border: '#222', input: '#1a1a1a', button: '#222', accent: '#ff6b6b' }
    : { bg: '#fff', text: '#000', border: '#e5e5e5', input: '#f5f5f5', button: '#f0f0f0', accent: '#e91e63' };
};
