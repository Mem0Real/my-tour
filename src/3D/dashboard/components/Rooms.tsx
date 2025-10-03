import React from 'react';
import { useAtomValue } from 'jotai';
import * as THREE from 'three';

import { pointsAtom, roomsAtom } from '@/utils/atoms/drawing';
import { CameraTypes } from '@/utils/constants';

import Wall from '@/3D/dashboard/components/Wall';
import LengthOverlay from '@/3D/dashboard/components/LengthOverlay';

import { cameraTypeAtom, rulerAtom } from '@/utils/atoms/ui';

export const Rooms = () => {
  const points = useAtomValue(pointsAtom);
  const rooms = useAtomValue(roomsAtom);
  const cameraType = useAtomValue(cameraTypeAtom);
  const ruler = useAtomValue(rulerAtom);

  return (
    <>
      {rooms.map((room, roomIndex) => {
        const len = room.length;
        if (len < 2) return null;

        const isClosed = room[0] === room[len - 1];
        const numSegments = len - 1; // Works for both: closed has extra index, open doesn't

        return (
          <group key={`room-${roomIndex}`}>
            {Array.from({ length: numSegments }).map((_, wIdx) => {
              const startIdx = room[wIdx];
              const endIdx = room[(wIdx + 1) % len]; // Safe for closed (wraps to 0 correctly)

              const start = points[startIdx];
              const end = points[endIdx];

              if (!start || !end) return null; // Guard against invalid indices

              // Compute prevDir
              let prevDir: THREE.Vector3 | null = null;
              if (wIdx > 0) {
                const prevWIdx = wIdx - 1;
                const prevStartIdx = room[prevWIdx];
                const prevStart = points[prevStartIdx];
                if (prevStart) {
                  prevDir = new THREE.Vector3().subVectors(start, prevStart).normalize();
                }
              } else if (isClosed) {
                const prevWIdx = numSegments - 1;
                const prevStartIdx = room[prevWIdx];
                const prevStart = points[prevStartIdx];
                if (prevStart) {
                  prevDir = new THREE.Vector3().subVectors(start, prevStart).normalize();
                }
              }

              // Compute nextDir
              let nextDir: THREE.Vector3 | null = null;
              if (wIdx < numSegments - 1) {
                const nextWIdx = wIdx + 1;
                const nextEndIdx = room[(nextWIdx + 1) % len];
                const nextEnd = points[nextEndIdx];
                if (nextEnd) {
                  nextDir = new THREE.Vector3().subVectors(nextEnd, end).normalize();
                }
              } else if (isClosed) {
                const nextWIdx = 0;
                const nextEndIdx = room[(nextWIdx + 1) % len];
                const nextEnd = points[nextEndIdx];
                if (nextEnd) {
                  nextDir = new THREE.Vector3().subVectors(nextEnd, end).normalize();
                }
              }

              return (
                <React.Fragment key={`wall-${roomIndex}-${wIdx}`}>
                  <Wall
                    start={start}
                    end={end}
                    color='white'
                    // prevDir={prevDir}
                    // nextDir={nextDir}
                    roomIndex={roomIndex}
                    id={wIdx}
                  />
                  {cameraType === CameraTypes.ORTHOGRAPHIC && ruler && <LengthOverlay start={start} end={end} />}
                </React.Fragment>
              );
            })}
          </group>
        );
      })}
    </>
  );
};
