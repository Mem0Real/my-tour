import React, { useEffect } from 'react';
import * as THREE from 'three';

import { useAtom, useAtomValue } from 'jotai';
import { isDrawingAtom, loopsAtom, previewPointAtom, snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';
import { activeToolAtom, cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { CameraTypes, WALL_HEIGHT, WALL_THICKNESS } from '@/utils/constants';

import { LengthOverlay } from '@/3D/dashboard/components/LengthOverlay';
import { SnapCues } from '@/3D/dashboard/components/SnapCues';
import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { Wall } from '@/3D/dashboard/components/Wall';
import { WallChain } from '@/3D/dashboard/components/WallChain';

export const Platform = () => {
  const loops = useAtomValue(loopsAtom);
  const cameraType = useAtomValue(cameraTypeAtom);
  const snapCues = useAtomValue(snapCuesAtom);
  const activeTab = useAtomValue(activeToolAtom);

  const { onPointerDown, onPointerMove, onPointerUp, onRightClick, onKeyDown } = useToolInput();
  return (
    <>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          onRightClick?.(e);
        }}
        onPointerMove={onPointerMove ?? undefined}
        onPointerUp={onPointerUp ?? undefined}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Finalized walls */}
      {loops.map((loopPoints, i) => (
        <WallChain
          key={i}
          points={loopPoints}
          thickness={WALL_THICKNESS}
          height={WALL_HEIGHT}
          color='gray'
          closed={true}
          overlay={true}
        />
      ))}

      {/* Snap cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
