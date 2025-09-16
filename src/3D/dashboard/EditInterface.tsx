import { Three } from '@/3D/base/Three';
import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { Platform } from '@/3D/dashboard/Platform';
import { cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { Html } from '@react-three/drei';
import { useSetAtom } from 'jotai';
import React, { useEffect } from 'react';

export function EditInterface() {
  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    setCursor(CursorTypes.POINTER);
  }, []);

  const handleClick = () => {
    console.log('Click on edit');
  };

  const handleRightClick = () => {
    console.log('RMB on edit');
  };

  const handlers = {
    onPointerDown: handleClick,
    onContextMenu: handleRightClick,
  };

  return (
    <>
      <ToolInputProvider value={handlers}>
        <Three>
          <Platform />
          <Html
            position={[0, 0, 0]}
            style={{
              background: 'white',
              color: '#1a1a1a',
              padding: '2px 2px',
              fontSize: '13px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            onPointerDown={handleClick}
            onContextMenu={handleRightClick}
          >
            Hello from editing
          </Html>
        </Three>
      </ToolInputProvider>
    </>
  );
}
