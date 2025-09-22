import { ActiveWallData, Room, SnapResult, Wall, WallData, WallIdentifier } from '@/utils/definitions';
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
// export function getMiterOffset(thisWallDir: THREE.Vector3, neighborDir: THREE.Vector3, thickness: number) {
//   let dot = thisWallDir.dot(neighborDir);
//   dot = THREE.MathUtils.clamp(dot, -1, 1);
//   const angle = Math.acos(dot);
//   if (Math.abs(angle) < 1e-4) return thickness / 2;
//   return thickness / 2 / Math.sin(angle / 2);
// }

export const getMiterOffset = (dir: THREE.Vector3, prevDir: THREE.Vector3, thickness: number): number => {
  const angle = dir.angleTo(prevDir);
  if (angle < 1e-3) return 0;
  return thickness / Math.tan(angle / 2);
};

export const getConnectedWalls = (rooms: Room[], wallData: ActiveWallData) => {
  const { roomIndex, wallIndex } = wallData;

  const room = rooms[roomIndex];
  const activeWall = room[wallIndex];
  const [start, end] = activeWall;

  const connectedWalls: WallIdentifier[] = [];

  // Basic connections (for one room)
  room.forEach((wall, wallIdx) => {
    if (wallIdx === wallIndex) return;

    let wallIdentifier: WallIdentifier | null = null;

    // If the wall's start is connected to the active wall's end
    if (wall[0].equals(end)) {
      wallIdentifier = { roomIndex, wallIndex: wallIdx, pointIndex: 0, pos: null };
    } else if (wall[1].equals(start)) wallIdentifier = { roomIndex, wallIndex: wallIdx, pointIndex: 1, pos: null };

    if (wallIdentifier) connectedWalls.push(wallIdentifier);
  });

  if (rooms.length == 1) return connectedWalls;

  // Advanced connections (for multiple rooms/loops)
  rooms.forEach((room, roomIdx) => {
    if (roomIdx === roomIndex) return;

    room.forEach((wall, wallIdx) => {
      let wallIdentifier: WallIdentifier | null = null;

      const haveSameZ = start.z === wall[0].z || start.z === wall[1].z;
      const haveSameX = start.x === wall[0].x || start.x === wall[1].x;

      if (!haveSameZ && !haveSameX) return;

      const isStartingOnWall = start.distanceTo(wall[0]) + wall[0].distanceTo(end) === start.distanceTo(end);
      const isEndingOnWall = start.distanceTo(wall[1]) + wall[1].distanceTo(end) === start.distanceTo(end);

      if ((haveSameZ || haveSameX) && (isStartingOnWall || isEndingOnWall)) {
        wallIdentifier = { roomIndex: roomIdx, wallIndex: wallIdx, pointIndex: isStartingOnWall ? 0 : 1, pos: null };
      }

      if (wallIdentifier) connectedWalls.push(wallIdentifier);
    });
    return;
  });

  return connectedWalls;
};

export const updateConnectedWalls = (
  activeRoomIndex: number,
  newStart: THREE.Vector3,
  newEnd: THREE.Vector3,
  rooms: Room[],
  connectedWalls: WallIdentifier[]
): Room[] => {
  const allRooms = [...rooms];

  // Loop through each stored walls and update corresponding entry in the respective room
  connectedWalls.forEach((entry, i) => {
    const { roomIndex, wallIndex, pointIndex } = entry;
    const focusedRoom = allRooms[roomIndex];
    const wall = focusedRoom[wallIndex];

    // Update current room
    if (activeRoomIndex === roomIndex) {
      wall[pointIndex] = pointIndex === 0 ? newEnd.clone() : newStart.clone();
    } else {
      const wallDir = new THREE.Vector3().subVectors(newEnd, newStart).setY(0);
      
      const isHorizontal = Math.abs(wallDir.z) === 0;
      const isVertical = Math.abs(wallDir.x) === 0;

      if (isHorizontal) {
        wall[pointIndex].z = newEnd.z;
      } else if (isVertical) {
        wall[pointIndex].x = newEnd.x;
      }
    }

    focusedRoom[wallIndex] = wall;

    allRooms[roomIndex] = focusedRoom;
  });

  return allRooms;
};
