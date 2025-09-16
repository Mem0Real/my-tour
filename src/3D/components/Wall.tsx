'use client';

import * as THREE from 'three';
import React, { FC, useMemo } from 'react';
import { WallProps, EndpointRef } from '@/utils/definitions';

export const Wall: FC<WallProps> = ({
  id,
  start,
  end,
  thickness = 0.1,
  height = 2.5,
  dashed = false,
  color = 'white',
  hovered
}: WallProps) => {
  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(end, start).setY(0), [start, end]);

  const length = dir.length();

  if (length < 1e-4) return null;
  const angle = Math.atan2(dir.z, dir.x); // [-PI, PI]

  return (
    <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={color} metalness={0} roughness={1} transparent={dashed} opacity={dashed ? 0.5 : 1} />
    </mesh>
  );
};
