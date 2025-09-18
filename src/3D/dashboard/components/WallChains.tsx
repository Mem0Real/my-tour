import React from 'react';
import * as THREE from 'three';

import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { wallsAtom } from '@/utils/atoms/drawing';
import { cameraTypeAtom } from '@/utils/atoms/ui';
import { useAtomValue } from 'jotai';
import { Wall } from '@/3D/dashboard/components/Wall';
import { CameraTypes, WALL_HEIGHT, WALL_THICKNESS } from '@/utils/constants';
import { LengthOverlay } from '@/3D/dashboard/components/LengthOverlay';

export const WallChains = () => {
  const walls = useAtomValue(wallsAtom);
  const cameraType = useAtomValue(cameraTypeAtom);

  const { onPointerDown, onPointerMove, onPointerUp, onRightClick, onKeyDown } = useToolInput();

  return walls.map(([start, end], i) => {
    if (!end) return null;

    // Compute prevDir & nextDir for the miter logic
    const prevDir =
      i > 0
        ? new THREE.Vector3().subVectors(start, walls[i - 1][0]).setY(0)
        : // .normalize()
          null;
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
          // prevDir={prevDir}
          // nextDir={nextDir}
        />
        {cameraType === CameraTypes.ORTHOGRAPHIC && (
          <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
        )}
      </React.Fragment>
    );
  });
};
