import { cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { useSetAtom } from 'jotai';
import React, { useEffect } from 'react';

export const EditInterface = () => {
  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    setCursor(CursorTypes.POINTER);
  }, []);

  return null;
};
