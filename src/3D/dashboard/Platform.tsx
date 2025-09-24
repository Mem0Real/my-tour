import React from 'react';

import { useAtomValue } from 'jotai';
import { snapCuesAtom } from '@/utils/atoms/drawing';

import { SnapCues } from '@/3D/dashboard/components/SnapCues';
import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { Rooms } from '@/3D/dashboard/components/Rooms';
import { activeToolAtom } from '@/utils/atoms/ui';
import { ThreeEvent } from '@react-three/fiber';

export const Platform = () => {
  const snapCues = useAtomValue(snapCuesAtom);
  const activeTool = useAtomValue(activeToolAtom);

  const { onPointerDown, onPointerMove, onPointerUp, onRightClick, handlePointerUp, handlePointerMove } =
    useToolInput();

  const handlePlatformMove = (e: ThreeEvent<MouseEvent>) => {
    switch (activeTool) {
      case 'add':
        onPointerMove?.(e);
        break;
      case 'edit':
        handlePointerMove?.(e);
        break;
    }
  };

  return (
    <>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          onRightClick?.(e);
        }}
        onPointerMove={handlePlatformMove}
        onPointerUp={activeTool === 'add' ? onPointerUp : activeTool === 'edit' ? handlePointerUp : undefined}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Rendered walls */}
      <Rooms />

      {/* Snap cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
