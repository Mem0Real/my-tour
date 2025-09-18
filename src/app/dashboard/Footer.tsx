'use client';

import { cameraTypeAtom, keyPressedAtom, numberPressedAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect } from 'react';

const { ORTHOGRAPHIC, PERSPECTIVE } = CameraTypes;

export const Footer = () => {
  const setCameraType = useSetAtom(cameraTypeAtom);

  const numberPressed = useAtomValue(numberPressedAtom);
  const keyPressed = useAtomValue(keyPressedAtom);

  useEffect(() => {
    if (!numberPressed && !keyPressed) return;
    if (numberPressed === 3 || keyPressed === 'f')
      setCameraType((prev) => (prev === PERSPECTIVE ? ORTHOGRAPHIC : PERSPECTIVE));
  }, [numberPressed, keyPressed]);

  return (
    <footer className='absolute bottom-20 left-1/2 z-50'>
      <div className='bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 dark:text-neutral-900  w-full rounded-lg flex justify-between gap-4 shadow-inner shadow-neutral-500/80 transition-all duration-300 ease-in-out'>
        <button
          className='hover:cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 w-full h-full px-5 py-2'
          onClick={() => {
            setCameraType((prev) => (prev === ORTHOGRAPHIC ? PERSPECTIVE : ORTHOGRAPHIC));
          }}
        >
          View
        </button>
      </div>
    </footer>
  );
};
