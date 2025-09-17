import * as THREE from 'three';
import React, { FC, useMemo } from 'react';
import { getMiterOffset } from '@/3D/helpers/wallHelper';
import { WallProps } from '@/utils/definitions';

export const Wall: FC<WallProps> = ({
  start,
  end,
  thickness = 0.1,
  height = 2.5,
  color = 'white',
  prevDir = null,
  nextDir = null,
}) => {
  const wallDir = new THREE.Vector3().subVectors(end, start).setY(0).normalize();

  // Only shift if direction differs from previous wall
  let startOffset = 0;
  let endOffset = 0;

  if (prevDir) {
    const angleDiff = wallDir.angleTo(prevDir);
    if (angleDiff > 1e-3) { // threshold to ignore straight continuation
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
    <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, thickness * 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
