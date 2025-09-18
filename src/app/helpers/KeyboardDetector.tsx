'use client';

import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';

import { keyPressedAtom, numberPressedAtom } from '@/utils/atoms/ui';

export function KeyboardListener() {
  const setNumberPressed = useSetAtom(numberPressedAtom);
  const setKeyPressed = useSetAtom(keyPressedAtom);

  const [shiftPressed, setShiftPressed] = useState(false);
  const [altPressed, setAltPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { repeat, key, altKey, shiftKey } = event;

      if (repeat) return;

      if ((altKey || altPressed) && key >= '1' && key <= '9') {
        setNumberPressed(Number(key));
        setAltPressed(true);
      }

      if ((shiftKey || shiftPressed) && key) setKeyPressed(key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const { key, altKey, shiftKey } = event;

      if (altKey) setAltPressed(false);
      if (shiftKey) setShiftPressed(false);

      if (key >= '1' && key <= '9') setNumberPressed(0);
      else {
        setKeyPressed('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
}
