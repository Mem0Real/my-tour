import { JSX } from 'react';

import * as THREE from 'three';
import { Line } from '@react-three/drei';

const straightThreshold = 0.08;
const snapTolerance = 0.15;

export interface SnapResult {
  snapPoint: THREE.Vector3 | null;
  snapType: 'x' | 'z' | 'edge' | null;
}

export const magneticSnap = (point: THREE.Vector3, last?: THREE.Vector3, edges?: THREE.Vector3[] | THREE.Vector3) => {
  let snapped = point.clone();

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

    if ((dxFirst < snapTolerance || dzFirst < snapTolerance) && edges.length > 0) {
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

  return snapped;
};

export const getSnapGuide = (
  points: THREE.Vector3[],
  currentPos: THREE.Vector3,
  snapTolerance = 0.2,
  thickness = 0.2
): SnapResult => {
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

export function adjustPointToEdge(point: THREE.Vector3, last: THREE.Vector3 | null, thickness: number): THREE.Vector3 {
  const adjusted = point.clone();

  if (!last) {
    // First point → just offset downwards along Z (or whichever axis your grid aligns)
    // This avoids "floating" in the center of the wall
    // adjusted.z -= thickness / 2;
    return adjusted;
  }

  // Subsequent clicks → align edge relative to last
  const dir = new THREE.Vector3().subVectors(point, last).normalize();

  // Perpendicular to wall direction
  const perp = new THREE.Vector3(-dir.z, 0, dir.x);

  // Offset new point by half thickness
  adjusted.add(perp.multiplyScalar(thickness / 2));

  return adjusted;
}

// ____________ Retry _______________ //

// Snaps point to horizontal or vertical if close enough
export const straighten = (from: THREE.Vector3, to: THREE.Vector3, straightThreshold: number) => {
  const snapped = to.clone();
  const dx = Math.abs(to.x - from.x);
  const dz = Math.abs(to.z - from.z);

  if (dx < straightThreshold) snapped.x = from.x;
  if (dz < straightThreshold) snapped.z = from.z;

  return snapped;
};
