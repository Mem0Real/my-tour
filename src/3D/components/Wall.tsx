'use client';

import * as THREE from 'three';
import React, { FC, useMemo } from 'react';

interface WallProps {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  height?: number;
  dashed?: boolean;
  color?: string;
  // new props for editor
  onHoverEndpoint?: (wallId: string, index: 0 | 1 | null) => void;
  onClickEndpoint?: (wallId: string, index: 0 | 1) => void;
  hoveredEndpoint?: { wallId: string; index: 0 | 1 } | null;
}

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

  const isHovered = (index: 0 | 1) => hoveredEndpoint?.wallId === id && hoveredEndpoint?.index === index;

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
        onPointerOver={() => onHoverEndpoint?.(id, 0)}
        onPointerOut={() => onHoverEndpoint?.(id, null)}
        onClick={() => onClickEndpoint?.(id, 0)}
      >
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial transparent opacity={50} />
      </mesh>
      {isHovered(0) && (
        <mesh position={start}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color='yellow' />
        </mesh>
      )}

      {/* End endpoint */}
      <mesh
        position={end}
        onPointerOver={() => onHoverEndpoint?.(id, 1)}
        onPointerOut={() => onHoverEndpoint?.(id, null)}
        onClick={() => onClickEndpoint?.(id, 1)}
      >
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial transparent opacity={50} />
      </mesh>
      {isHovered(1) && (
        <mesh position={end}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color='yellow' />
        </mesh>
      )}
    </group>
  );
};
