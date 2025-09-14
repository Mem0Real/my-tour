import * as THREE from 'three';
import React, { FC } from 'react';
import { LengthOverlay } from '@/3D/components/LengthOverlay';

interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  height?: number;
  dashed?: boolean;
  showLength?: boolean;
  color?: string;
}

export const Wall: FC<WallProps> = ({
  start,
  end,
  thickness = 0.1,
  height = 2.5,
  dashed = false,
  showLength = false,
  color = 'white',
}: WallProps) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length() + thickness;
  const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
  const angle = Math.atan2(dir.z, dir.x);

  return (
    <>
      <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial color={dashed ? 'gray' : 'white'} metalness={0} roughness={1} />
      </mesh>
      {showLength && <LengthOverlay start={start} end={end} />}
    </>
  );
};
