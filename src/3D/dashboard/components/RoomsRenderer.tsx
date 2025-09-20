import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { activeWallAtom, roomsAtom } from '@/utils/atoms/drawing';
import { cameraTypeAtom } from '@/utils/atoms/ui';
import { useAtomValue } from 'jotai';
import { Wall } from '@/3D/dashboard/components/Wall';
import { CameraTypes, WALL_HEIGHT, WALL_THICKNESS } from '@/utils/constants';
import { LengthOverlay } from '@/3D/dashboard/components/LengthOverlay';
import { WallEndPoints } from '@/3D/dashboard/components/WallEndPoints';

export const RoomRenderer = () => {
  const rooms = useAtomValue(roomsAtom);
  const cameraType = useAtomValue(cameraTypeAtom);
  const activeWall = useAtomValue(activeWallAtom);
  const { handlePointerDown, handlePointerOver, handlePointerOut } = useToolInput();

  const [wallColor, setWallColor] = useState<{ roomIndex: number; wallIndex: number; color: string } | null>(null);

  useEffect(() => {
    if (activeWall) {
      setWallColor({ roomIndex: activeWall.roomIndex, wallIndex: activeWall.wallIndex, color: 'lightblue' });
    } else {
      setWallColor(null);
    }
  }, [activeWall, rooms]);

  return (
    <>
      {rooms.map((room, roomIndex) =>
        room.map(([start, end], wallIndex) => {
          if (!end) return null;

          const isActive = wallColor?.roomIndex === roomIndex && wallColor?.wallIndex === wallIndex;

          return (
            <group
              key={`wall-${roomIndex}-${wallIndex}`}
              onPointerDown={(e) => handlePointerDown?.(e, { roomIndex, wallIndex, start, end })}
              onPointerOver={(e) => handlePointerOver?.(e, { roomIndex, wallIndex, start, end })}
              onPointerOut={handlePointerOut}
            >
              <Wall
                id={wallIndex}
                roomIndex={roomIndex}
                start={start}
                end={end}
                thickness={WALL_THICKNESS}
                height={WALL_HEIGHT}
                color={isActive ? wallColor.color : '#e2e2e2'}
              />
              {cameraType === CameraTypes.ORTHOGRAPHIC && (
                <>
                  <WallEndPoints wallIndex={wallIndex} start={start} end={end} roomIndex={roomIndex} />
                  <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
                </>
              )}
            </group>
          );
        })
      )}
    </>
  );
};
