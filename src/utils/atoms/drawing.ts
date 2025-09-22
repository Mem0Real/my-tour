import { ActiveWallData, EndpointRef, Room, Wall } from '@/utils/definitions';
import { atom } from 'jotai';
import * as THREE from 'three';

export const isDrawingAtom = atom(false);
export const wallPointsAtom = atom<THREE.Vector3[]>([]); // points of the chain
export const previewPointAtom = atom<THREE.Vector3 | null>(null);
export const snapCuesAtom = atom<THREE.Vector3[]>([]);

export const pointsAtom = atom<THREE.Vector3[]>([]);
export const roomsAtom = atom<Room[]>([]);

// Derived walls for rendering or helpers
export const wallsAtom = atom((get) => {
  const points = get(pointsAtom);
  const rooms = get(roomsAtom);
  return rooms.flatMap((room) =>
    room.map((idx, i) => {
      const wallSegment = [points[idx], points[room[(i + 1) % room.length]]] as unknown as Wall;
      return wallSegment;
    })
  );
});

export const activeWallAtom = atom<ActiveWallData | null>(null);

// Active endpoint for dragging corners - updated to match new EndpointRef
export const activeEndpointAtom = atom<EndpointRef | null>(null);

// Optional: Keep updateWallAtom if needed for legacy, but refactor to use points/rooms directly
export const updateWallAtom = atom(
  null,
  (get, set, { roomIndex, wallIndex, newWall }: { roomIndex: number; wallIndex: number; newWall: Wall }) => {
    const rooms = get(roomsAtom);
    const points = get(pointsAtom);
    const updatedRooms = rooms.map((room, i) => {
      if (i !== roomIndex) return room;
      return room.map((wall, j) => (j === wallIndex ? wall : wall));
    });
    // Note: With shared points, updating wall means updating points indices or positions
    set(roomsAtom, updatedRooms);
  }
);
