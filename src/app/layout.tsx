import type { Metadata } from 'next';
import './globals.css';
import { Children } from '@/utils/definitions';
import { Navbar } from '@/app/components/Navbar';
import { CursorProvider } from '@/app/providers/CursorProvider';
import { Provider } from 'jotai';

export const metadata: Metadata = {
  title: 'My Tour',
  description: 'MT',
};

export default function RootLayout({ children }: Readonly<Children>) {
  return (
    <html lang='en'>
      <body>
        <Provider>
          <Navbar />
          <CursorProvider />
          {children}
        </Provider>
      </body>
    </html>
  );
}
