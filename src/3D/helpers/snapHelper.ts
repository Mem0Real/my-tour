import { SnapResult } from '@/utils/definitions';
import * as THREE from 'three';

// Snaps point to horizontal or vertical if close enough
export const straighten = (from: THREE.Vector3, to: THREE.Vector3, straightThreshold: number) => {
  const snapped = to.clone();
  const dx = Math.abs(to.x - from.x);
  const dz = Math.abs(to.z - from.z);

  if (dx < straightThreshold) snapped.x = from.x;
  if (dz < straightThreshold) snapped.z = from.z;

  return snapped;
};

export const snapToPoints = (
  cursor: THREE.Vector3,
  points: THREE.Vector3[],
  walls: [THREE.Vector3, THREE.Vector3][],
  tolerance: number
): SnapResult => {
  // First, snap to points
  for (let p of points) {
    if (cursor.distanceTo(p) < tolerance) return { snappedPoint: p.clone() };
  }

  // Snap to wall axes
  for (let [start, end] of walls) {
    // Project cursor onto the wall line
    const wallDir = new THREE.Vector3().subVectors(end, start).normalize();
    const wallLen = wallDir.length();

    const startToCursor = new THREE.Vector3().subVectors(cursor, start);
    const projection = startToCursor.dot(wallDir);

    // clamp projection to wall segment
    const clamped = Math.max(0, Math.min(wallLen, projection));
    const projectedPoint = start.clone().add(wallDir.multiplyScalar(clamped));

    if (cursor.distanceTo(projectedPoint) < tolerance) {
      return { snappedPoint: projectedPoint, snappedWall: [start, end] };
    }
  }

  // No snap
  return { snappedPoint: cursor };
};
