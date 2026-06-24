import { Colors, Theme } from '@/app/types';

export const getColors = (theme: Theme): Colors => {
  return theme === 'dark'
    ? {
        bg: '#0a0a0a',
        text: '#fff',
        border: '#1a1a1a',
        input: '#1a1a1a',
        button: '#2a2a2a',
        primary: '#ff1493', // DeepPink
        secondary: '#ff69b4', // HotPink
        accent: '#d946ef', // Magenta (LGBTQ+ friendly)
      }
    : {
        bg: '#fafafa',
        text: '#000',
        border: '#e5e5e5',
        input: '#f5f5f5',
        button: '#f0f0f0',
        primary: '#ff1493',
        secondary: '#ff69b4',
        accent: '#d946ef',
      };
};

export const gradients = {
  pink: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
  purple: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
  lesbian: 'linear-gradient(135deg, #ff7a00 0%, #ff1493 50%, #ffffff 100%)',
  rainbow: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 17%, #ffff00 33%, #00ff00 50%, #0000ff 67%, #4b0082 83%, #9400d3 100%)',
};
