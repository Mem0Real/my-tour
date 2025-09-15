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

  onHoverEndpoint,
  onClickEndpoint,

  hoveredEndpoint,
}: WallProps) => {
  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(end, start).setY(0), [start, end]);

  const length = dir.length();

  // Geometries
  const triangleGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(thickness, 0);
    shape.lineTo(0, thickness);
    shape.lineTo(0, 0);

    return new THREE.ShapeGeometry(shape);
  }, [thickness]);

  const squareGeometry = useMemo(() => new THREE.PlaneGeometry(thickness, thickness), [thickness]);

  if (length < 1e-4) return null;
  const angle = Math.atan2(dir.z, dir.x);// [-PI, PI]

  const isHovered = (index: 0 | 1) => hoveredEndpoint?.wallIndex === id && hoveredEndpoint?.pointIndex === index;

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
      <group position={[start.x, height + 0.01, start.z]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <mesh
          geometry={triangleGeometry}
          // position={[start.x, start.y + 10, start.z]}
          rotation={[0, 0, 0]}
          onPointerOver={() => onHoverEndpoint?.({ wallIndex: id, pointIndex: 0 })}
          onPointerOut={() => onHoverEndpoint?.(null)}
          onClick={() => onClickEndpoint?.({ wallIndex: id, pointIndex: 0 })}
        >
          <meshStandardMaterial color={'yellow'} visible={isHovered(0)} />
        </mesh>
      </group>

      {/* End endpoint */}
      <group position={[end.x, height + 0.01, end.z]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <mesh
          geometry={triangleGeometry}
          // position={[end.x, end.y + 10, end.z]}
          rotation={[0, 0, 0]}
          onPointerOver={() => onHoverEndpoint?.({ wallIndex: id, pointIndex: 1 })}
          onPointerOut={() => onHoverEndpoint?.(null)}
          onClick={() => onClickEndpoint?.({ wallIndex: id, pointIndex: 1 })}
        >
          <meshStandardMaterial color={'yellow'} visible={isHovered(1)} />
        </mesh>
      </group>
    </group>
  );
};
