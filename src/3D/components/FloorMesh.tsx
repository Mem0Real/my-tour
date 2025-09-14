import React, { FC, useMemo } from 'react';
import * as THREE from 'three';

interface Props {
  points: THREE.Vector3[]; // closed polygon (not repeating first point)
  color?: string;
}

export const FloorMesh: FC<Props> = ({ points, color = '#ddd' }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (!points || points.length === 0) return s;
    s.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      s.lineTo(points[i].x, points[i].z);
    }
    s.closePath();
    return s;
  }, [points]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
};