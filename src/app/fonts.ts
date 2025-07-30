import { Kalam, Bubblegum_Sans, Fredoka, Inter } from 'next/font/google';

export const kalam = Kalam({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
  display: 'swap',
});

export const bubblegumSans = Bubblegum_Sans({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bubblegum',
  display: 'swap',
});

export const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});