import * as THREE from 'three';
import React, { FC, useMemo } from 'react';
import { WallProps } from '@/utils/definitions';

export const Wall: FC<WallProps> = ({ start, end, thickness = 0.1, height = 2.5, color = 'white', id = 0 }) => {
  // Compute wall direction
  const wallDir = new THREE.Vector3().subVectors(end, start).setY(0).normalize();

  // Compute perpendicular vector for dynamic offset
  // Flip direction depending on mouse movement or id parity if needed
  const perpDir = useMemo(() => {
    // For even walls: shift one way, for odd: shift opposite
    const side = id % 2 === 0 ? 1 : -1;
    return new THREE.Vector3(-wallDir.z * side, 0, wallDir.x * side);
  }, [wallDir, id]);

  const offsetStart = start.clone().add(perpDir.clone().multiplyScalar(thickness));
  const offsetEnd = end.clone().add(perpDir.clone().multiplyScalar(thickness));

  const mid = useMemo(() => new THREE.Vector3().lerpVectors(offsetStart, offsetEnd, 0.5), [offsetStart, offsetEnd]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(offsetEnd, offsetStart), [offsetStart, offsetEnd]);
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
