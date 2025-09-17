'use client';

import React, { useEffect } from 'react';

import { Three } from '@/3D/base/Three';
import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { Children } from '@/utils/definitions';
import { Html } from '@react-three/drei';
import { useSetAtom } from 'jotai';

export function EditInterface({ children }: Children) {
  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    console.log('[EditInterface] Load');
    setCursor(CursorTypes.POINTER);
  }, []);

  // This will ONLY fire when the actual Html element is clicked
  const handlePointerDown = (e: MouseEvent) => {
    e.stopPropagation();
    console.log('Click on edit Html', e);
  };

  const handleRightClick = (e: MouseEvent) => {
    e.stopPropagation();
    console.log('Html onClick', e);
  };

  const handlePointerOver = (e: MouseEvent) => {
    console.log('hovering Html', e);
  };

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerOver: handlePointerOver,
    onRightClick: handleRightClick,
  };

  return (
    <ToolInputProvider value={handlers}>
      {children}
      <mesh onPointerDown={handlePointerDown} onClick={handlePointerDown} onPointerOver={handlePointerOver}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={'lightblue'} />
      </mesh>
    </ToolInputProvider>
  );
}
