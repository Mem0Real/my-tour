'use client';

import * as THREE from 'three';
import React, { FC, useMemo } from 'react';
import { WallProps } from '@/utils/definitions';

export const Wall: FC<WallProps> = ({
  id,
  start,
  end,
  thickness = 0.1,
  height = 2.5,
  visible = false,
  color = 'white',
}: WallProps) => {
  const dir = useMemo(() => new THREE.Vector3().subVectors(end, start).setY(0), [start, end]);
  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);

  const length = dir.length();
  if (length < 1e-4) return null;

  const angle = Math.atan2(dir.z, dir.x);
  const boxLength = visible ? length + thickness : length; // Extend only finalized walls

  return (
    <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[boxLength, height, thickness]} />
      <meshStandardMaterial color={color} metalness={0} roughness={1} opacity={1} />
    </mesh>
  );
};
