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

      {walls.map(([start, end], i) => {
        if (!end) return null;

        // Compute prevDir & nextDir for the miter logic
        const prevDir =
          i > 0
            ? new THREE.Vector3()
                .subVectors(start, walls[i - 1][0])
                .setY(0)
                .normalize()
            : null;
        const nextDir =
          i < walls.length - 1
            ? new THREE.Vector3()
                .subVectors(walls[i + 1][1], end)
                .setY(0)
                .normalize()
            : null;

        return (
          <React.Fragment key={`wall-${i}`}>
            <Wall
              id={i}
              start={start}
              end={end}
              thickness={WALL_THICKNESS}
              height={WALL_HEIGHT}
              color={'lightgrey'}
              prevDir={prevDir}
              nextDir={nextDir}
            />
            {cameraType === CameraTypes.ORTHOGRAPHIC && (
              <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
            )}
          </React.Fragment>
        );
      })}
      {/* Snap cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
