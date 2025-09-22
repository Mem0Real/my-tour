import { ActiveWallData, Room, SnapResult, Wall } from '@/utils/definitions';
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
  points: THREE.Vector3[],
  rooms: Room[],
  tolerance: number
): SnapResult => {
  let snappedPoint = cursor.clone();
  let snappedPointIdx: number | undefined;
  let snappedRoomIdx: number | undefined;
  let snappedWallIdx: number | undefined;
  let snappedWall: Wall | undefined;

  // Axis snap to all points and current loop
  const allPositions = [...currentLoopPositions, ...points];
  allPositions.forEach((p) => {
    if (Math.abs(cursor.x - p.x) < tolerance) snappedPoint.x = p.x;
    if (Math.abs(cursor.z - p.z) < tolerance) snappedPoint.z = p.z;
  });

  // Snap to existing points (priority over wall snap)
  let minDist = Infinity;
  points.forEach((p, idx) => {
    const dist = snappedPoint.distanceTo(p);
    if (dist < tolerance && dist < minDist) {
      minDist = dist;
      snappedPoint = p.clone();
      snappedPointIdx = idx;
    }
  });

  if (snappedPointIdx !== undefined) {
    return { snappedPoint, snappedPointIdx };
  }

  // Snap to walls
  outer: for (let rIdx = 0; rIdx < rooms.length; rIdx++) {
    const room = rooms[rIdx];
    const len = room.length;
    for (let wIdx = 0; wIdx < len; wIdx++) {
      const startIdx = room[wIdx];
      const endIdx = room[(wIdx + 1) % len];
      const start = points[startIdx];
      const end = points[endIdx];

      const wallDir = end.clone().sub(start);
      const wallLength = wallDir.length();
      if (wallLength === 0) continue;

      const dirNormalized = wallDir.clone().normalize();
      const projLength = snappedPoint.clone().sub(start).dot(dirNormalized); // Use axis-snapped point for projection

      if (projLength < -tolerance || projLength > wallLength + tolerance) continue;

      const projPoint = start.clone().add(dirNormalized.multiplyScalar(projLength));
      if (projPoint.distanceTo(snappedPoint) < tolerance) {
        snappedPoint = projPoint;
        snappedWall = [start, end];
        snappedRoomIdx = rIdx;
        snappedWallIdx = wIdx;

        // Check if close to endpoint
        if (projLength < tolerance) {
          snappedPointIdx = startIdx;
        } else if (projLength > wallLength - tolerance) {
          snappedPointIdx = endIdx;
        }

        break outer; // Prioritize first hit
      }
    }
  }

  return { snappedPoint, snappedWall, snappedPointIdx, snappedRoomIdx, snappedWallIdx };
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

export const getMiterOffset = (dir: THREE.Vector3, prevDir: THREE.Vector3, thickness: number): number => {
  const angle = dir.angleTo(prevDir);
  if (angle < 1e-3) return 0;
  return thickness / Math.tan(angle / 2);
};
export const getColinearChain = (rooms: Room[], points: THREE.Vector3[], active: ActiveWallData): number[] => {
  const { roomIndex, wallIndex } = active;
  const room = rooms[roomIndex];
  const len = room.length;

  const getDir = (segIdx: number) => {
    const start = room[segIdx];
    const end = room[(segIdx + 1) % len];
    return points[end].clone().sub(points[start]).normalize();
  };

  const activeDir = getDir(wallIndex);

  // Extend backward
  let currentStart = wallIndex;
  while (true) {
    const prev = (currentStart - 1 + len) % len;
    const prevDir = getDir(prev);
    const angle = activeDir.angleTo(prevDir);
    if (angle > 1e-3 && Math.abs(angle - Math.PI) > 1e-3) break;
    currentStart = prev;
  }

  // Extend forward
  let currentEnd = wallIndex;
  while (true) {
    const next = (currentEnd + 1) % len;
    const nextDir = getDir(currentEnd);
    const angle = activeDir.angleTo(nextDir);
    if (angle > 1e-3 && Math.abs(angle - Math.PI) > 1e-3) break;
    currentEnd = next;
  }

  // Collect unique point indices in the chain
  const chain: number[] = [];
  for (let i = currentStart; ; i = (i + 1) % len) {
    chain.push(room[i]);
    if (i === currentEnd) break;
  }
  chain.push(room[(currentEnd + 1) % len]); // Include the final end point

  return [...new Set(chain)]; // Ensure unique
};
