'use client';

import { useAtomValue } from 'jotai';
import { cursorTypeAtom } from '@/utils/atoms';
import { useEffect } from 'react';

export const CursorProvider = () => {
  const cursor = useAtomValue(cursorTypeAtom);

  useEffect(() => {
    document.body.style.cursor = cursor;
  }, [cursor]);

  return null;
}