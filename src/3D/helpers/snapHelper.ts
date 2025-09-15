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
  currentLoopPositions: THREE.Vector3[],
  allWalls: [THREE.Vector3, THREE.Vector3][],
  tolerance: number
): SnapResult => {
  let snappedPoint = cursor.clone();
  let snappedWall: [THREE.Vector3, THREE.Vector3] | undefined;

  // Snap to X/Z axis of existing points
  [...currentLoopPositions, ...allWalls.flatMap(([a, b]) => [a, b])].forEach((p) => {
    if (Math.abs(cursor.x - p.x) < tolerance) snappedPoint.x = p.x;
    if (Math.abs(cursor.z - p.z) < tolerance) snappedPoint.z = p.z;
  });

  // Snap to walls
  for (const wall of allWalls) {
    const { start, end } = { start: wall[0], end: wall[1] };

    // Project cursor onto wall line
    const wallDir = end.clone().sub(start);
    const wallLength = wallDir.length();

    if (wallLength === 0) continue;

    const dirNormalized = wallDir.clone().normalize();
    const projLength = cursor.clone().sub(start).dot(dirNormalized);

    if (projLength < -tolerance || projLength > wallLength + tolerance) continue;

    const projPoint = start.clone().add(dirNormalized.multiplyScalar(projLength));
    if (projPoint.distanceTo(cursor) < tolerance) {
      snappedPoint = projPoint;
      snappedWall = wall;
      break; // prioritize first wall hit
    }
  }

  return { snappedPoint, snappedWall };
};
