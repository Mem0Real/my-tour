import { ActiveWallData, Room, Wall, WallData } from '@/utils/definitions';
import { atom } from 'jotai';
import * as THREE from 'three';

// export const wallsAtom = atom<[THREE.Vector3, THREE.Vector3][]>([]); // array of [start, end]
// export const loopsAtom = atom<THREE.Vector3[][]>([]);
export const isDrawingAtom = atom(false);
export const wallPointsAtom = atom<THREE.Vector3[]>([]); // points of the chain
export const previewPointAtom = atom<THREE.Vector3 | null>(null);
export const snapCuesAtom = atom<THREE.Vector3[]>([]);
// export const activeWallAtom = atom<WallData | null>(null);

// Wall Stuff
export const roomsAtom = atom<Room[]>([]);

export const wallsAtom = atom((get) => {
  const rooms = get(roomsAtom);
  return rooms.flat(); // flatten array of arrays
});

export const activeWallAtom = atom<ActiveWallData | null>(null);

// Active endpoint for dragging corners, similarly enriched
export const activeEndpointAtom = atom<{ roomIndex: number; wallIndex: number; pointIndex: 0 | 1 } | null>(null);

// Update a wall inside a room
export const updateWallAtom = atom(
  null,
  (get, set, { roomIndex, wallIndex, newWall }: { roomIndex: number; wallIndex: number; newWall: Wall }) => {
    const rooms = get(roomsAtom);
    const updatedRooms = rooms.map((room, i) => {
      if (i !== roomIndex) return room;
      return room.map((wall, j) => (j === wallIndex ? newWall : wall));
    });
    set(roomsAtom, updatedRooms);
  }
);
