'use client';

import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';

import { keyPressedAtom } from '@/utils/atoms/ui';

export function KeyboardDetector() {
  const setKeyPressed = useSetAtom(keyPressedAtom);

  const [shiftPressed, setShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { repeat, key, shiftKey } = event;

      if (repeat) return;

      if ((shiftKey || shiftPressed) && key) setKeyPressed(key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const { shiftKey } = event;

      if (shiftKey) setShiftPressed(false);
      setKeyPressed('');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setKeyPressed, shiftPressed]);

  return null;
}
