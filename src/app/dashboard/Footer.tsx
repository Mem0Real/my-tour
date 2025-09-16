'use client';

import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';
import { useSetAtom } from 'jotai';
import React from 'react';

export const Footer = () => {
  const setCameraType = useSetAtom(cameraTypeAtom);
  
  return (
    <footer className='absolute bottom-20 left-1/2 z-50'>
      <div className='text-neutral-300 bg-neutral-700 w-full rounded-lg flex justify-between gap-4'>
        <button
          className='hover:cursor-pointer w-full h-full px-5 py-2'
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
