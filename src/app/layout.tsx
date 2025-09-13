import type { Metadata } from 'next';
import './globals.css';
import { Children } from '@/utils/definitions';

export const metadata: Metadata = {
  title: 'My Tour',
  description: 'MT',
};

export default function RootLayout({ children }: Readonly<Children>) {
  return (
    <html lang='en'>
      <body className={``}>{children}</body>
    </html>
  );
}
