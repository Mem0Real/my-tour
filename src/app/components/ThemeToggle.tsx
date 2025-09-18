'use client';

import { keyPressedAtom } from '@/utils/atoms/ui';
import { useAtom, useAtomValue } from 'jotai';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const keyPressed = useAtomValue(keyPressedAtom);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!keyPressed) return;
    if (keyPressed === 'd') setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [keyPressed]);

  if (!mounted) return null;

  return (
    <button
      className='p-2 bg-none cursor-pointer hover:bg-neutral-600/70 rounded-2xl'
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
    >
      {theme === 'dark' ? <Moon color='#DAD9D7' size={20} /> : <SunMedium color='#FFD700' size={20} />}
    </button>
  );
};
