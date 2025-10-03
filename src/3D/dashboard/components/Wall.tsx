import * as THREE from 'three';
import React, { FC, useMemo } from 'react';
import { getMiterOffset } from '@/3D/helpers/wallHelper';
import { WallProps } from '@/utils/definitions';
import { useToolInput } from '@/3D/dashboard/components/ToolInputContext';
import { useAtomValue } from 'jotai';
import { cameraTypeAtom, menuVisibleAtom, wallHeightAtom, wallThicknessAtom } from '@/utils/atoms/ui';
import { Menu } from '@/app/dashboard/components/Menu';
import { CameraTypes } from '@/utils/constants';

const Wall: FC<WallProps> = React.memo(
  ({ start, end, color = 'white', prevDir = null, nextDir = null, roomIndex, id }) => {
    const handlers = useToolInput();

    const thickness = useAtomValue(wallThicknessAtom);
    const height = useAtomValue(wallHeightAtom);
    const menuVisible = useAtomValue(menuVisibleAtom);
    const cameraType = useAtomValue(cameraTypeAtom)

    const wallDir = new THREE.Vector3().subVectors(end, start).setY(0).normalize();

    let startOffset = 0;
    let endOffset = 0;

    if (prevDir) {
      const angleDiff = wallDir.angleTo(prevDir);
      if (angleDiff > 1e-3) {
        startOffset = getMiterOffset(wallDir, prevDir, thickness);
        endOffset = nextDir ? getMiterOffset(wallDir.clone().negate(), nextDir, thickness) : 0;
      }
    }

    const adjStart = start.clone().add(wallDir.clone().negate().multiplyScalar(startOffset));
    const adjEnd = end.clone().add(wallDir.clone().multiplyScalar(endOffset));

    const mid = useMemo(() => new THREE.Vector3().lerpVectors(adjStart, adjEnd, 0.5), [adjStart, adjEnd]);
    const dir = useMemo(() => new THREE.Vector3().subVectors(adjEnd, adjStart), [adjStart, adjEnd]);
    const length = dir.length();
    if (length < 1e-4) return null;

    const angle = Math.atan2(dir.z, dir.x);

    return (
      <group>
        <mesh
          position={[mid.x, height / 2, mid.z]}
          rotation={[0, -angle, 0]}
          onPointerDown={(e) => {
            // e.stopPropagation();
            if (handlers.handlePointerDown && roomIndex !== undefined && id !== undefined) {
              handlers.handlePointerDown(e, { roomIndex, wallIndex: id });
            }
          }}
          onPointerOver={(e) => {
            if (handlers.handlePointerOver && roomIndex !== undefined && id !== undefined) {
              handlers.handlePointerOver(e, { roomIndex, wallIndex: id });
            }
          }}
          onPointerOut={handlers.handlePointerOut}
          onContextMenu={(e) => {
            if (handlers.handleRightClick) {
              console.log(`WallIdx: ${id}, roomIndex: ${roomIndex}`);
              handlers.handleRightClick(e, { wallIndex: id!, roomIndex: roomIndex! });
            }
          }}
        >
          <boxGeometry args={[length, height, thickness * 2]} />
          <meshStandardMaterial color={color} opacity={1} transparent />
        </mesh>
        {menuVisible !== null && cameraType === CameraTypes.ORTHOGRAPHIC && <Menu />}
      </group>
    );
  }
);

Wall.displayName = 'Wall';

export default Wall;
