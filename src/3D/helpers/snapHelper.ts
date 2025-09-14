import { JSX } from 'react';

import * as THREE from 'three';
import { Line } from '@react-three/drei';

const straightThreshold = 0.08;
const snapTolerance = 0.15;

export const snapThreshold = 0.2;
const halfThickness = 0.2 / 2;

export interface SnapResult {
  snapPoint: THREE.Vector3 | null;
  snapType: 'x' | 'z' | 'edge' | null;
}

export const magneticSnap = (point: THREE.Vector3, last?: THREE.Vector3, edges?: THREE.Vector3[] | THREE.Vector3) => {
  const snapped = point.clone();

  // Straighten relative to last point
  if (last) {
    const dx = snapped.x - last.x;
    const dz = snapped.z - last.z;

    // almost horizontal
    if (Math.abs(dz) < straightThreshold) {
      snapped.z = last.z;
    }
    // almost vertical
    if (Math.abs(dx) < straightThreshold) {
      snapped.x = last.x;
    }
  }

  // Snap against edges, including offsets for wall thickness
  if (edges && Array.isArray(edges)) {
    edges.forEach((edge) => {
      if (Math.abs(snapped.x - edge.x) < snapTolerance) {
        snapped.x = edge.x;
      }
      if (Math.abs(snapped.z - edge.z) < snapTolerance) {
        snapped.z = edge.z;
      }
    });

    return snapped;
  } else if (edges) {
    if (Math.abs(snapped.x - edges.x) < snapTolerance) {
      snapped.x = edges.x;
    }
    if (Math.abs(snapped.z - edges.z) < snapTolerance) {
      snapped.z = edges.z;
    }
  }

  return snapped;
};

export const getSnapGuide = (
  points: THREE.Vector3[],
  currentPos: THREE.Vector3,
  snapThreshold: number = 0.2
): SnapResult => {
  let snapPoint: THREE.Vector3 | null = null;
  let snapType: 'x' | 'z' | 'edge' | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    // Check vertical alignment (x)
    if (Math.abs(currentPos.x - start.x) < snapThreshold) {
      snapPoint = new THREE.Vector3(start.x, 0, currentPos.z);
      snapType = 'x';
    }

    // Check horizontal alignment (z)
    if (Math.abs(currentPos.z - start.z) < snapThreshold) {
      snapPoint = new THREE.Vector3(currentPos.x, 0, start.z);
      snapType = 'z';
    }

    // Check if near edge midpoint (optional magnetic snapping)
    const edgeMid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dist = edgeMid.distanceTo(currentPos);

    if (dist < snapThreshold) {
      snapPoint = edgeMid;
      snapType = 'edge';
    }
  }

  return { snapPoint, snapType };
};
