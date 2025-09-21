'use client';

import { activeEndpointAtom } from '@/utils/atoms/drawing';
import { activeToolAtom, cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { ThreeEvent } from '@react-three/fiber';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import * as THREE from 'three';

interface WallEndPointsProps {
  wallIndex: number;
  roomIndex: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
}

export const WallEndPoints = ({ wallIndex, roomIndex, start, end }: WallEndPointsProps) => {
  const [activeEndpoint, setActiveEndpoint] = useAtom(activeEndpointAtom);
  const activeTool = useAtomValue(activeToolAtom);
  const setCursor = useSetAtom(cursorTypeAtom);

  const handleEndDown = (e: ThreeEvent<MouseEvent>, pointIndex: 0 | 1) => {
    if (activeTool !== 'edit') return;
    e.stopPropagation();
    setActiveEndpoint({ roomIndex, wallIndex, pointIndex });
    setCursor(CursorTypes.GRABBING);
  };

  const handleEndUp = (e: ThreeEvent<MouseEvent>) => {
    if (activeTool !== 'edit') return;
    e.stopPropagation();
    setActiveEndpoint(null);
    setCursor(CursorTypes.POINTER);
  };

  const handleEndOver = (e: ThreeEvent<MouseEvent>) => {
    if (activeTool !== 'edit') return;
    e.stopPropagation();
    setCursor(CursorTypes.GRAB);
  };

  const handleEndOut = (e: ThreeEvent<MouseEvent>) => {
    if (activeTool !== 'edit') return;
    e.stopPropagation();
    if (!activeEndpoint) setCursor(CursorTypes.POINTER);
  };

  return [start, end].map((pos, pointIndex) => (
    <mesh
      key={`endpoint-${roomIndex}-${wallIndex}-${pointIndex}`}
      position={pos}
      onPointerDown={(e) => handleEndDown(e, pointIndex as 0 | 1)}
      onPointerUp={handleEndUp}
      onPointerOver={handleEndOver}
      onPointerOut={handleEndOut}
    >
      <sphereGeometry args={[0.1]} /> {/* Adjust sphere size */}
      <meshStandardMaterial color={'#e2e2e2'} opacity={0.6} />
    </mesh>
  ));
};
