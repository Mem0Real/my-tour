import { JSX } from 'react';

import * as THREE from 'three';
import { Line } from '@react-three/drei';

const straightThreshold = 0.08;
const snapTolerance = 0.15;

export interface SnapResult {
  snapPoint: THREE.Vector3 | null;
  snapType: 'x' | 'z' | 'edge' | null;
}

export const magneticSnap = (
  point: THREE.Vector3,
  last?: THREE.Vector3,
  edges?: THREE.Vector3[] | THREE.Vector3,
  snapTolerance = 0.2,
  straightThreshold = 0.2
) => {
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
  if (edges?.length && Array.isArray(edges)) {
    const first = edges[0];
    const dxFirst = Math.abs(snapped.x - first.x);
    const dzFirst = Math.abs(snapped.z - first.z);

    if (dxFirst < snapTolerance || dzFirst < snapTolerance) {
      // snapped.copy(first); // snap straight to first point
      if (dxFirst < snapTolerance) snapped.x = first.x;
      if (dzFirst < snapTolerance) snapped.z = first.z;

      return snapped;
    }

    edges.forEach((edge) => {
      if (Math.abs(snapped.x - edge.x) < snapTolerance) {
        snapped.x = edge.x;
      }
      if (Math.abs(snapped.z - edge.z) < snapTolerance) {
        snapped.z = edge.z;
      }
    });

    return snapped;
  }

  // else if (edges) {
  //   if (Math.abs(snapped.x - edges.x) < snapTolerance) {
  //     snapped.x = edges.x;
  //   }
  //   if (Math.abs(snapped.z - edges.z) < snapTolerance) {
  //     snapped.z = edges.z;
  //   }
  // }

  return snapped;
};

export const getSnapGuide = (points: THREE.Vector3[], currentPos: THREE.Vector3, snapTolerance = 0.2): SnapResult => {
  let snapPoint: THREE.Vector3 | null = null;
  let snapType: 'x' | 'z' | 'edge' | null = null;

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    const dxFirst = Math.abs(currentPos.x - start.x);
    const dzFirst = Math.abs(currentPos.z - start.z);

    if (dxFirst < snapTolerance || dzFirst < snapTolerance) {
      // Check vertical alignment (x)
      if (dxFirst < snapTolerance) {
        snapPoint = new THREE.Vector3(start.x, 0, currentPos.z);
        snapType = 'x';
      }

      // Check horizontal alignment (z)
      if (dzFirst < snapTolerance) {
        snapPoint = new THREE.Vector3(currentPos.x, 0, start.z);
        snapType = 'z';
      }
      return { snapPoint, snapType };
    }

    // Check if near edge midpoint (optional magnetic snapping)
    const edgeMid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dist = edgeMid.distanceTo(currentPos);

    if (dist < snapTolerance) {
      snapPoint = edgeMid;
      snapType = 'edge';
    }
  }

  return { snapPoint, snapType };
};
