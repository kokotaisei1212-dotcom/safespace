import { Theme, Colors } from '@/app/types';

const colors = {
  dark: {
    bg: '#000000',
    text: '#ffffff',
    border: '#262626',
    input: '#1a1a1a',
    button: '#2a2a2a',
    accent: '#ff1493',
  },
  light: {
    bg: '#ffffff',
    text: '#000000',
    border: '#e5e5e5',
    input: '#f5f5f5',
    button: '#efefef',
    accent: '#ff1493',
  },
};

export const gradients = {
  pink: 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
  purple: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
  lesbian: 'linear-gradient(135deg, #ff7a00 0%, #ff1493 50%, #ffffff 100%)',
};

export function getColors(theme: Theme): Colors {
  return colors[theme];
}
