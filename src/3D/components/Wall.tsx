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
  dashed = false,
  color = 'white',
  onHoverEndpoint,
  onClickEndpoint,
  hoveredEndpoint,
}: WallProps) => {
  const dir = useMemo(() => new THREE.Vector3().subVectors(end, start).setY(0), [start, end]);
  const length = dir.length();

  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);

  if (length < 1e-4) return null;

  const angle = Math.atan2(dir.z, dir.x);

  const isHovered = (index: 0 | 1) => hoveredEndpoint === index;

  return (
    <group>
      {/* Main wall */}
      <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial
          color={color}
          metalness={0}
          roughness={1}
          transparent={dashed}
          opacity={dashed ? 0.5 : 1}
        />
      </mesh>

      {/* Start endpoint */}
      <mesh
        position={start}
        onPointerOver={() => onHoverEndpoint?.(0)}
        onPointerOut={() => onHoverEndpoint?.(null)}
        onClick={() => onClickEndpoint?.(0)}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        {isHovered(0) && <meshStandardMaterial color={'orange'} />}
      </mesh>

      {/* End endpoint */}
      <mesh
        position={end}
        onPointerOver={() => onHoverEndpoint?.(1)}
        onPointerOut={() => onHoverEndpoint?.(null)}
        onClick={() => onClickEndpoint?.(1)}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        {isHovered(1) && <meshStandardMaterial color={'orange'} />}
      </mesh>
    </group>
  );
};
