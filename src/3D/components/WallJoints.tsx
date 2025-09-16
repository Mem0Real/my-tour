import * as THREE from 'three';
import React, { useMemo } from 'react';
import { JointProps } from '@/utils/definitions';

export const WallJoints = ({
  id,
  start,
  end,
  thickness = 0.1,
  height = 2.5,

  onHoverEndpoint,
  onClickEndpoint,

  hoveredEndpoint,
}: JointProps) => {
  const squareGeometry = useMemo(() => new THREE.PlaneGeometry(thickness, thickness), [thickness]);
  const isHovered = (index: 0 | 1) => hoveredEndpoint?.wallIndex === id && hoveredEndpoint?.pointIndex === index;

  const yOffset = height + 0.01 + id * 0.001; // small per-wall offset
  const startPos = [start.x, yOffset, start.z] as [number, number, number];
  const endPos = [end.x, yOffset, end.z] as [number, number, number];

  return (
    <group>
      <mesh
        geometry={squareGeometry}
        position={startPos}
        rotation={[-Math.PI / 2, 0, 0]} // lay flat on XZ plane
        onPointerOver={() => onHoverEndpoint?.({ wallIndex: id, pointIndex: 0 })}
        onPointerOut={() => onHoverEndpoint?.(null)}
        onClick={() => onClickEndpoint?.({ wallIndex: id, pointIndex: 0 })}
      >
        <meshStandardMaterial color={'yellow'} visible={isHovered(0)} side={THREE.DoubleSide} />
      </mesh>

      {/* End endpoint square */}
      <mesh
        geometry={squareGeometry}
        position={endPos}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={() => onHoverEndpoint?.({ wallIndex: id, pointIndex: 1 })}
        onPointerOut={() => onHoverEndpoint?.(null)}
        onClick={() => onClickEndpoint?.({ wallIndex: id, pointIndex: 1 })}
      >
        <meshStandardMaterial color={'yellow'} visible={isHovered(1)} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
