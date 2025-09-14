import type { Metadata } from 'next';
import './globals.css';
import { Children } from '@/utils/definitions';
import { Navbar } from '@/app/components/Navbar';
import { CursorProvider } from '@/app/providers/CursorProvider';

export const metadata: Metadata = {
  title: 'My Tour',
  description: 'MT',
};

export default function RootLayout({ children }: Readonly<Children>) {
  return (
    <html lang='en'>
      <body>
        <Navbar />
        <CursorProvider />
        {children}
      </body>
    </html>
  );
}
