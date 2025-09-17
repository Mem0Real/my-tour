import React, { useEffect } from 'react';
import * as THREE from 'three';

import { useAtomValue } from 'jotai';
import { snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';
import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes, WALL_HEIGHT, WALL_THICKNESS } from '@/utils/constants';

import { LengthOverlay } from '@/3D/dashboard/components/LengthOverlay';
import { SnapCues } from '@/3D/dashboard/components/SnapCues';
import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { Wall } from '@/3D/dashboard/components/Wall';

export const Platform = () => {
  const walls = useAtomValue(wallsAtom);
  const cameraType = useAtomValue(cameraTypeAtom);
  const snapCues = useAtomValue(snapCuesAtom);

  const { onPointerDown, onPointerMove, onPointerUp, onRightClick, onKeyDown } = useToolInput();

  useEffect(() => {
    console.log('[Platform] Load');
  }, []);

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
      {walls.map(([start, end], i) => (
        <React.Fragment key={`wall-${i}`}>
          <Wall id={i} start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} color={'lightgrey'} />

          {cameraType === CameraTypes.ORTHOGRAPHIC && (
            <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
          )}
        </React.Fragment>
      ))}

      {/* Snap cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
