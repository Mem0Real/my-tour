import { Three } from '@/3D/base/Three';
import { LengthOverlay } from '@/3D/dashboard/components/LengthOverlay';
import { SnapCues } from '@/3D/dashboard/components/SnapCues';
import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { Wall } from '@/3D/dashboard/components/Wall';
import { isDrawingAtom, previewPointAtom, snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';
import { activeToolAtom, cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { CameraTypes, WALL_HEIGHT, WALL_THICKNESS } from '@/utils/constants';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect } from 'react';

export const Platform = () => {
  const walls = useAtomValue(wallsAtom);
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
      {walls.map(([start, end], i) => (
        <React.Fragment key={`wall-${i}`}>
          <Wall id={i} start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} color='white' visible />
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
