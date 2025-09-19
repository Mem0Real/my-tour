import React from 'react';

import { useAtomValue } from 'jotai';
import { snapCuesAtom } from '@/utils/atoms/drawing';

import { SnapCues } from '@/3D/dashboard/components/SnapCues';
import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { WallChains } from '@/3D/dashboard/components/WallChains';
import { Three } from '@/3D/base/Three';
import { activeToolAtom } from '@/utils/atoms/ui';

export const Platform = () => {
  const snapCues = useAtomValue(snapCuesAtom);
  const activeTool = useAtomValue(activeToolAtom);

  const { onPointerDown, onPointerMove, onPointerUp, onRightClick, onKeyDown, handlePointerUp, handlePointerMove } =
    useToolInput();

  const handlePlatformMove = (e: any) => {
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
        // onPointerMove={onPointerMove ?? undefined}
        onPointerMove={handlePlatformMove}
        onPointerUp={activeTool === 'add' ? onPointerUp : activeTool === 'edit' ? handlePointerUp : undefined}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Rendered walls */}
      <WallChains />

      {/* Snap cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
