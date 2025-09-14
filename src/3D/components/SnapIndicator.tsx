import { Line } from '@react-three/drei';
import * as THREE from 'three';
import React, { JSX } from 'react';

interface SnapIndicatorProps {
  points: THREE.Vector3[];
  currentPos?: THREE.Vector3;
  isDrawing: boolean;
  snapThreshold?: number;
}

export const SnapIndicator: React.FC<SnapIndicatorProps> = ({ points, currentPos, isDrawing, snapThreshold = 0.2 }) => {
  if (!isDrawing || !currentPos || points.length === 0) return null;

  let closestX: any;
  let closestZ: any;
  let minDistX = Infinity;
  let minDistZ = Infinity;

  points.forEach((p: THREE.Vector3) => {
    const dx = Math.abs(currentPos.x - p.x);
    const dz = Math.abs(currentPos.z - p.z);

    if (dx < snapThreshold && dx < minDistX) {
      closestX = p;
      minDistX = dx;
    }
    if (dz < snapThreshold && dz < minDistZ) {
      closestZ = p;
      minDistZ = dz;
    }
  });

  const guides: JSX.Element[] = [];

  if (closestX) {
    // use array of [x, y, z] tuples to satisfy Drei Line typing
    guides.push(
      <Line
        key='snap-x'
        points={[
          [closestX.x, 0, -100],
          [closestX.x, 0, 100],
        ]}
        color='yellow'
        lineWidth={2}
      />
    );
  }

  if (closestZ) {
    guides.push(
      <Line
        key='snap-z'
        points={[
          [-100, 0, closestZ.z],
          [100, 0, closestZ.z],
        ]}
        color='yellow'
        lineWidth={2}
      />
    );
  }

  return <>{guides}</>;
};
