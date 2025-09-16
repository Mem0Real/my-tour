'use client';

import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';

import { keysPressedAtom } from '@/utils/atoms/ui';

export function KeyboardListener() {
  const setKeysPressed = useSetAtom(keysPressedAtom);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { repeat, key, altKey } = event;

      if (repeat) return;

      if (altKey && key >= '1' && key <= '9') setKeysPressed(Number(key));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const { key } = event;

      if (key >= '1' && key <= '9') setKeysPressed(0);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeysPressed]);

  return null;
}
