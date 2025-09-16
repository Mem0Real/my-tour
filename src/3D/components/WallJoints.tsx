import * as THREE from 'three';
import React, { useMemo } from 'react';
import { JointProps, EndpointRef } from '@/utils/definitions';
import { useSetAtom } from 'jotai';
import { cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';

export const WallJoints = ({
  walls,
  thickness = 0.1,
  height = 2.5,
  onHoverEndpoint,
  onClickEndpoint,
  hoveredEndpoint,
}: JointProps) => {
  const setCursor = useSetAtom(cursorTypeAtom);

  // Create hitboxes for each wall's start and end points with offsets
  const endpoints = useMemo(() => {
    const points: { wallIndex: number; pointIndex: 0 | 1; pos: THREE.Vector3; offset: THREE.Vector3 }[] = [];
    walls.forEach(([start, end], wallIndex) => {
      // Calculate wall direction for offset
      const dir = new THREE.Vector3().subVectors(end, start).normalize();
      const offsetMagnitude = thickness; // Small offset, half the wall thickness
      const startOffset = dir.clone().multiplyScalar(-offsetMagnitude); // Offset inward from start
      const endOffset = dir.clone().multiplyScalar(offsetMagnitude); // Offset inward from end

      points.push({
        wallIndex,
        pointIndex: 0,
        pos: start.clone().add(startOffset),
        offset: startOffset,
      });
      points.push({
        wallIndex,
        pointIndex: 1,
        pos: end.clone().add(endOffset),
        offset: endOffset,
      });
    });
    return points;
  }, [walls, thickness]);

  return (
    <>
      {endpoints.map(({ wallIndex, pointIndex, pos }, idx) => {
        const isHovered = hoveredEndpoint?.wallIndex === wallIndex && hoveredEndpoint?.pointIndex === pointIndex;

        return (
          <mesh
            key={`endpoint-${wallIndex}-${pointIndex}`}
            position={[pos.x, height + 0.01, pos.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={() => {
              onHoverEndpoint?.({ wallIndex, pointIndex, pos: walls[wallIndex][pointIndex] });
              setCursor(CursorTypes.GRAB);
            }}
            onPointerOut={() => {
              onHoverEndpoint?.(null);
              setCursor(CursorTypes.PENCIL);
            }}
            onClick={() => onClickEndpoint?.({ wallIndex, pointIndex, pos: walls[wallIndex][pointIndex] })}
          >
            <sphereGeometry args={[thickness * 0.5, 12, 12]} />
            <meshStandardMaterial color='yellow' transparent opacity={isHovered ? 1 : 0.5} />
          </mesh>
        );
      })}
    </>
  );
};
