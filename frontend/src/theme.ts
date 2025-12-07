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
      '#e8f4ff', '#d3e5f8', '#a7caf0', '#78ade8', '#5294e0',
      '#3982db', '#2878d9', '#1a64c2', '#0f59b0', '#004c9e',
    ],
    blue: [
      '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7',
      '#339af0', '#0795ED', '#1c7ed6', '#1971c2', '#1864ab',
    ],
    black: [
      '#000000', '#000000', '#000000', '#000000', '#000000',
      '#000000', '#000000', '#000000', '#000000', '#000000',
    ]
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