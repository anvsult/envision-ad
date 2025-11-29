import { createTheme } from '@mantine/core';
import { Josefin_Sans, Lato } from 'next/font/google';

const josefinSans = Josefin_Sans({
    subsets: ['latin'],
    variable: '--font-josefin',
    display: 'swap',
});

const lato = Lato({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-lato',
    display: 'swap',
});

export const theme = createTheme({
  colors: {
    deepBlue: [
      '#eef3ff', '#dce4f5', '#b9c7e2', '#94a8d0', '#748dc1',
      '#5f7cb8', '#5474b4', '#44639f', '#39588f', '#2d4b81',
    ],
    blue: [
      '#eef3ff', '#dee2f2', '#bdc2de', '#98a0ca', '#7a84ba',
      '#6672b0', '#5c68ac', '#4c5897', '#424e88', '#011f96',
    ],
  },
  fontFamily: 'var(--font-lato), Lato, sans-serif', // for all regular text
  headings: {
    fontFamily: 'var(--font-josefin), Josefin Sans, sans-serif',
    sizes: {
      h1: { fontSize: '36px' },
      h2: { fontSize: '24px' },
      h3: { fontSize: '20px' },
      h4: { fontSize: '16px' },
      h5: { fontSize: '14px' },
    },
  },
  defaultRadius: 'lg',
});

// Export fonts to use in layout.tsx
export { josefinSans, lato };