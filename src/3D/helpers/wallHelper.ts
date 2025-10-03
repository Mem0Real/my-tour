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

export const getMiterOffset = (dir: THREE.Vector3, prevDir: THREE.Vector3, thickness: number): number => {
  const angle = dir.angleTo(prevDir);
  if (angle < 1e-3) return 0;
  return thickness / Math.tan(angle / 2);
};

export const getColinearChain = (rooms: Room[], points: THREE.Vector3[], active: ActiveWallData): number[] => {
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
  const visitedSegments = new Set<string>(); // To prevent cycles

  // Add initial segment points
  const startPoint = activeRoom[wallIndex];
  const endPoint = activeRoom[(wallIndex + 1) % len];
  chainSet.add(startPoint);
  chainSet.add(endPoint);
  visitedSegments.add(`${roomIndex}-${wallIndex}`);

  // Recursive function to extend chain from a point in a direction
  const extendChain = (pointIdx: number, dir: THREE.Vector3, isForward: boolean) => {
    rooms.forEach((r, rIdx) => {
      const rLen = r.length;
      for (let sIdx = 0; sIdx < rLen; sIdx++) {
        const segKey = `${rIdx}-${sIdx}`;
        if (visitedSegments.has(segKey)) continue;

        const sStart = r[sIdx];
        const sEnd = r[(sIdx + 1) % rLen];
        if (sStart === pointIdx || sEnd === pointIdx) {
          const segDir = getDir(r, sIdx);
          const angle = dir.angleTo(segDir);
          const revAngle = dir.angleTo(segDir.clone().negate());
          if (angle < 1e-2 || revAngle < 1e-2) {
            // Colinear
            visitedSegments.add(segKey);
            const nextPoint = sStart === pointIdx ? sEnd : sStart;
            if (!chainSet.has(nextPoint)) {
              chainSet.add(nextPoint);
              extendChain(nextPoint, segDir, isForward);
            }
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
  let current =
    Array.from(chainSet).find((idx) => {
      let degree = 0;
      rooms.forEach((r) =>
        r.forEach((p) => {
          if (p === idx) degree++;
        })
      );
      return degree === 1; // Find endpoint
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

export const isOpenEndpoint = (pointIdx: number, rooms: Room[], points: THREE.Vector3[]): boolean => {
  let degree = 0;
  rooms.forEach((room) => {
    room.forEach((idx, i) => {
      if (idx === pointIdx) degree++; // Count occurrences in loop
    });
  });
  return degree === 1; // Open if exactly one connection (degree 1)
};
