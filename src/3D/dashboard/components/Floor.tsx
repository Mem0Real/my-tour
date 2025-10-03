import React from 'react';
import { useAtomValue } from 'jotai';
import * as THREE from 'three';

import { pointsAtom, roomsAtom } from '@/utils/atoms/drawing';
import { FLOOR_THICKNESS } from '@/utils/constants'; // Add to constants if not already

interface FloorProps {
  roomIndex: number;
}

export const Floor = ({ roomIndex }: FloorProps) => {
  const points = useAtomValue(pointsAtom);
  const rooms = useAtomValue(roomsAtom);

  const room = rooms[roomIndex];
  const len = room.length;
  if (len < 3) return null; // At least 3 points for a polygon

  // Use all points for open rooms; slice duplicate for closed
  const floorPoints = room[0] === room[len - 1] ? room.slice(0, -1) : room;
  const shapePoints = floorPoints.map((idx) => new THREE.Vector2(points[idx].x, points[idx].z));
  const shape = new THREE.Shape(shapePoints);

  return (
    <mesh position-y={FLOOR_THICKNESS / 2} rotation={[Math.PI / 2, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color='gray' side={THREE.BackSide} />
    </mesh>
  );
};
