import { SnapResult, Wall } from '@/utils/definitions';
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
  allWalls: Wall[],
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

export function generateCornerFillers(loop: THREE.Vector3[], thickness: number, height: number): THREE.Mesh[] {
  const fillers: THREE.Mesh[] = [];

  for (let i = 0; i < loop.length; i++) {
    const prev = loop[(i - 1 + loop.length) % loop.length];
    const curr = loop[i];
    const next = loop[(i + 1) % loop.length];

    const dir1 = new THREE.Vector2()
      .subVectors(new THREE.Vector2(curr.x, curr.z), new THREE.Vector2(prev.x, prev.z))
      .normalize();

    const dir2 = new THREE.Vector2()
      .subVectors(new THREE.Vector2(next.x, next.z), new THREE.Vector2(curr.x, curr.z))
      .normalize();

    const normal1 = new THREE.Vector2(-dir1.y, dir1.x).multiplyScalar(thickness * 8);
    const normal2 = new THREE.Vector2(-dir2.y, dir2.x).multiplyScalar(thickness * 8);

    const p1 = new THREE.Vector3(curr.x + normal1.x, 0, curr.z + normal1.y);
    const p2 = new THREE.Vector3(curr.x + normal2.x, 0, curr.z + normal2.y);

    const shape = new THREE.Shape();
    shape.moveTo(curr.x, curr.z);
    shape.lineTo(p1.x, p1.z);
    shape.lineTo(p2.x, p2.z);
    shape.lineTo(curr.x, curr.z);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({ color: 'black' });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.01; // Slight lift to avoid z-fighting

    fillers.push(mesh);
  }

  return fillers;
}

/**
 * Returns the miter offset for a wall endpoint given its neighbor direction.
 * @param thisWallDir - normalized direction of this wall (use .negate() for start)
 * @param neighborDir - normalized direction of adjacent wall
 * @param thickness - wall thickness
 */
export function getMiterOffset(thisWallDir: THREE.Vector3, neighborDir: THREE.Vector3, thickness: number) {
  let dot = thisWallDir.dot(neighborDir);
  dot = THREE.MathUtils.clamp(dot, -1, 1);
  const angle = Math.acos(dot);
  if (Math.abs(angle) < 1e-4) return thickness / 2;
  return thickness / 2 / Math.sin(angle / 2);
}

export const computeWinding = (points: THREE.Vector3[]): number => {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += (b.x - a.x) * (b.z + a.z);
  }
  return sum; // >0 = clockwise, <0 = counter-clockwise
};
