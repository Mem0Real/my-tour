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

export const getColinearChain = (
  rooms: Room[],
  points: THREE.Vector3[],
  active: ActiveWallData
): number[] => {
  const { roomIndex, wallIndex } = active;
  const activeRoom = rooms[roomIndex];
  const len = activeRoom.length;

  const getDir = (r: Room, segIdx: number) => {
    const start = r[segIdx];
    const end = r[(segIdx + 1) % r.length];
    return points[end].clone().sub(points[start]).normalize();
  };

  const activeDir = getDir(activeRoom, wallIndex);
  const chainSet = new Set<number>();
  const startPoint = activeRoom[wallIndex];
  const endPoint = activeRoom[(wallIndex + 1) % len];

  chainSet.add(startPoint);
  chainSet.add(endPoint);

  // Function to extend chain from a point in a direction
  const extendChain = (pointIdx: number, dir: THREE.Vector3, isForward: boolean, depth = 0) => {
    if (depth > 10) return; // Prevent infinite loops
    rooms.forEach((r, rIdx) => {
      const rLen = r.length;
      for (let sIdx = 0; sIdx < rLen; sIdx++) {
        const sStart = r[sIdx];
        const sEnd = r[(sIdx + 1) % rLen];
        if ((sStart === pointIdx || sEnd === pointIdx) && !chainSet.has(sEnd) && !chainSet.has(sStart)) {
          const segDir = getDir(r, sIdx);
          const angle = dir.angleTo(segDir);
          const revAngle = dir.angleTo(segDir.clone().negate());
          if (angle < 1e-2 || revAngle < 1e-2) { // Colinear
            const nextPoint = (sStart === pointIdx) ? sEnd : sStart;
            chainSet.add(nextPoint);
            extendChain(nextPoint, segDir, isForward, depth + 1);
          } else if (angle < Math.PI / 2 + 1e-2 && !isForward) { // Perpendicular backward (T-junction)
            const nextPoint = (sStart === pointIdx) ? sEnd : sStart;
            chainSet.add(nextPoint);
            extendChain(nextPoint, segDir, false, depth + 1);
          }
        }
      }
    });
  };

  // Extend from start and end
  extendChain(startPoint, activeDir.clone().negate(), false);
  extendChain(endPoint, activeDir, true);

  // Order the chain along the line
  const orderedChain: number[] = [];
  let current = Array.from(chainSet).find((idx) => {
    let degree = 0;
    rooms.forEach((r) => r.forEach((p, i) => {
      if (p === idx) degree++;
    }));
    return degree === 1; // Find an endpoint
  }) || startPoint;

  while (current !== undefined && orderedChain.length < chainSet.size) {
    orderedChain.push(current);
    let next: number | undefined;
    rooms.forEach((r) => {
      const rLen = r.length;
      for (let sIdx = 0; sIdx < rLen; sIdx++) {
        const sStart = r[sIdx];
        const sEnd = r[(sIdx + 1) % rLen];
        if (sStart === current && chainSet.has(sEnd) && !orderedChain.includes(sEnd)) {
          next = sEnd;
          break;
        } else if (sEnd === current && chainSet.has(sStart) && !orderedChain.includes(sStart)) {
          next = sStart;
          break;
        }
      }
    });
    current = next!;
  }

  return orderedChain;
};
