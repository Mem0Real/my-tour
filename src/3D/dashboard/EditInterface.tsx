'use client';

import React, { useEffect } from 'react';

import { Three } from '@/3D/base/Three';
import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { Children, WallData } from '@/utils/definitions';
import { useSetAtom } from 'jotai';
import { activeWallAtom } from '@/utils/atoms/drawing';

export function EditInterface({ children }: Children) {
  const setCursor = useSetAtom(cursorTypeAtom);
  const setActiveWall = useSetAtom(activeWallAtom);

  useEffect(() => {
    setCursor(CursorTypes.POINTER);
  }, []);

  // This will ONLY fire when the actual Html element is clicked
  const handlePointerDown = (e: MouseEvent, wallData?: WallData) => {
    // e.stopPropagation();
    if (!wallData) return;

    setActiveWall(wallData);
  };

  const handleRightClick = (e: MouseEvent) => {
    e.stopPropagation();
    console.log('Html onClick', e);
  };

  const handlePointerOver = (e: MouseEvent) => {
    console.log('hovering Html', e);
  };

  const handlers = {
    handlePointerDown: handlePointerDown,
    handlePointerOver: handlePointerOver,
    handleRightClick: handleRightClick,
  };

  return (
    <ToolInputProvider value={handlers}>
      {children}
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color={'lightblue'} />
        </mesh>
    </ToolInputProvider>
  );
}
