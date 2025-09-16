import { Three } from '@/3D/base/Three';
import { LengthOverlay } from '@/3D/dashboard/LengthOverlay';
import { SnapCues } from '@/3D/dashboard/SnapCues';
import { Wall } from '@/3D/dashboard/Wall';
import { Tools } from '@/app/dashboard/components/Tools';
import { isDrawingAtom, previewPointAtom, snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';
import { activeTabAtom, cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { CameraTypes, WALL_HEIGHT, WALL_THICKNESS } from '@/utils/constants';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';

import {
  onPointerDownAtom,
  onPointerMoveAtom,
  onPointerUpAtom,
  onKeyDownAtom,
  onRightClick,
} from '@/utils/atoms/sceneHandlers';

export const Platform = () => {
  const walls = useAtomValue(wallsAtom);
  const cameraType = useAtomValue(cameraTypeAtom);
  const snapCues = useAtomValue(snapCuesAtom);
  const activeTab = useAtomValue(activeTabAtom);

  const pointerDown = useAtomValue(onPointerDownAtom);
  const pointerMove = useAtomValue(onPointerMoveAtom);
  const pointerUp = useAtomValue(onPointerUpAtom);
  const rightClick = useAtomValue(onRightClick);
  const keyDown = useAtomValue(onKeyDownAtom);

  useEffect(() => {
    console.log('plat');

    if (!keyDown) return;
    const listener = (e: KeyboardEvent) => keyDown(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [keyDown]);

  return (
    <>
      <Tools />
      
      <Three>
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.01, 0]}
          onPointerDown={(e) => {
            pointerDown?.(e);
            rightClick?.(e);
          }}
          onPointerMove={pointerMove ?? undefined}
          onPointerUp={pointerUp ?? undefined}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>

        {/* Finalized walls */}
        {walls.map(([start, end], i) => (
          <React.Fragment key={`wall-${i}`}>
            <Wall
              id={i}
              start={start}
              end={end}
              thickness={WALL_THICKNESS}
              height={WALL_HEIGHT}
              color='white'
              visible
            />
            {cameraType === CameraTypes.ORTHOGRAPHIC && (
              <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
            )}
          </React.Fragment>
        ))}

        {/* Snap cues */}
        <SnapCues points={snapCues} />
      </Three>
    </>
  );
};
