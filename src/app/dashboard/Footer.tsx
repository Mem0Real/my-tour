'use client';

import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';
import { useSetAtom } from 'jotai';
import React from 'react';

const { ORTHOGRAPHIC, PERSPECTIVE } = CameraTypes;

export const Footer = () => {
  const setCameraType = useSetAtom(cameraTypeAtom);

  return (
    <footer className='absolute bottom-20 left-1/2 z-50'>
      <div className='bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 dark:text-neutral-900  w-full flex justify-between gap-4 shadow-inner shadow-neutral-500/80 transition-all duration-300 ease-in-out rounded-sm hover:rounded-lg'>
        <button
          className='hover:cursor-pointer w-full h-full px-3 py-2 text-sm'
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
