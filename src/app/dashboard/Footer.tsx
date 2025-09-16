'use client';

import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';
import { useSetAtom } from 'jotai';
import React from 'react';

export const Footer = () => {
  const setCameraType = useSetAtom(cameraTypeAtom);

  return (
    <footer className='absolute bottom-20 left-1/2 z-50'>
      <div className='text-neutral-900 bg-neutral-200/40 w-full rounded-lg flex justify-between gap-4 shadow-inner shadow-neutral-500/80 transition-all duration-300 ease-in-out'>
        <button
          className='hover:cursor-pointer hover:bg-neutral-300 w-full h-full px-5 py-2'
          onClick={() => {
            setCameraType((prev) =>
              prev === CameraTypes.ORTHOGRAPHIC ? CameraTypes.PERSPECTIVE : CameraTypes.ORTHOGRAPHIC
            );
          }}
        >
          Cam
        </button>
      </div>
    </footer>
  );
};
