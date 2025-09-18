import type { Metadata } from 'next';
import './globals.css';
import { Children } from '@/utils/definitions';
import { Navbar } from '@/app/components/Navbar';
import { CursorProvider } from '@/app/providers/CursorProvider';
import { Provider } from 'jotai';
import { ThemeProvider } from '@/app/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'My Tour',
  description: 'MT',
};

export default function RootLayout({ children }: Readonly<Children>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme='system' attribute={'data-theme'} enableSystem>
          <Provider>
            <Navbar />
            <CursorProvider />
            {children}
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
