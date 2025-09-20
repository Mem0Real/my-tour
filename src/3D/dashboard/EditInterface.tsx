'use client';

import React, { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { cameraTypeAtom, cursorTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes, CursorTypes, SNAP_TOLERANCE } from '@/utils/constants';
import { Children, WallData, ActiveWallData } from '@/utils/definitions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeEndpointAtom, activeWallAtom, roomsAtom } from '@/utils/atoms/drawing';
import { ThreeEvent } from '@react-three/fiber';

export function EditInterface({ children }: Children) {
  const [initialCursorPos, setInitialCursorPos] = useState<THREE.Vector3 | null>(null);
  const [initialWallPos, setInitialWallPos] = useState<[THREE.Vector3, THREE.Vector3] | []>([]);

  const [rooms, setRooms] = useAtom(roomsAtom);
  const [activeWall, setActiveWall] = useAtom(activeWallAtom); // { roomIndex, wallIndex, id, start, end }
  const [activeEndpoint, setActiveEndpoint] = useAtom(activeEndpointAtom);

  const cameraType = useAtomValue(cameraTypeAtom);
  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    setCursor(CursorTypes.POINTER);
  }, [setCursor]);

  // Click on wall
  const handlePointerDown = (e: ThreeEvent<MouseEvent>, wallData?: ActiveWallData) => {
    if (!wallData || !e.point || e.button === 2) return;
    if (cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    setActiveWall(wallData);
    setInitialCursorPos(e.point.clone().setY(0));
    setInitialWallPos([wallData.start.clone(), wallData.end.clone()]);

    setCursor(CursorTypes.GRABBING);
  };

  // Release
  const handlePointerUp = () => {
    if (!activeWall) return;

    setActiveWall(null);
    setCursor((prev) => (prev === CursorTypes.GRABBING ? CursorTypes.GRAB : CursorTypes.POINTER));
    setInitialWallPos([]);
    setActiveEndpoint(null);
  };

  // Move
  const handlePointerMove = (e: ThreeEvent<MouseEvent>) => {
    if (!e.point || cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    if (activeWall) {
      handleWallMove(cursor);
    } else if (activeEndpoint) {
      handleEndpointMove(cursor);
    }
  };

  // Move whole wall with snapping/axis lock
  const handleWallMove = (cursor: THREE.Vector3) => {
    if (!activeWall || !initialCursorPos) return;

    const updatedRooms = [...rooms];
    const { roomIndex, wallIndex } = activeWall;

    if (!updatedRooms[roomIndex]) return;

    const room = updatedRooms[roomIndex].slice();
    if (!room[wallIndex]) return;

    const initStart = initialWallPos[0]!;
    const initEnd = initialWallPos[1]!;

    const wallDir = new THREE.Vector3().subVectors(initEnd, initStart).setY(0);
    const isHorizontal = Math.abs(wallDir.x) > Math.abs(wallDir.z);

    const delta = new THREE.Vector3(cursor.x - initialCursorPos.x, 0, cursor.z - initialCursorPos.z);

    let newStart = initStart.clone();
    let newEnd = initEnd.clone();

    if (isHorizontal) {
      newStart.x = initStart.x;
      newEnd.x = initEnd.x;
      newStart.z += delta.z;
      newEnd.z += delta.z;
    } else {
      newStart.z = initStart.z;
      newEnd.z = initEnd.z;
      newStart.x += delta.x;
      newEnd.x += delta.x;
    }

    room[wallIndex] = [newStart, newEnd];

    // Update continuity in the room loop
    const roomLength = room.length;
    if (wallIndex === 0 && room[roomLength - 1][1].equals(initStart)) {
      room[roomLength - 1][1] = newStart.clone();
    }
    if (wallIndex === roomLength - 1 && room[0][0].equals(initEnd)) {
      room[0][0] = newEnd.clone();
    }
    if (wallIndex > 0) {
      room[wallIndex - 1][1] = newStart.clone();
    }
    if (wallIndex < roomLength - 1) {
      room[wallIndex + 1][0] = newEnd.clone();
    }

    updatedRooms[roomIndex] = room;
    setRooms(updatedRooms);
  };

  // Move a single endpoint independently (dis-joint)
  const handleEndpointMove = (cursor: THREE.Vector3) => {
    if (!activeEndpoint) return;

    const updatedRooms = [...rooms];
    const { roomIndex, wallIndex, pointIndex } = activeEndpoint;

    if (!updatedRooms[roomIndex]) return;
    const room = updatedRooms[roomIndex].slice();

    if (!room[wallIndex]) return;

    // Update only the single endpoint's position
    const updatedWall: [THREE.Vector3, THREE.Vector3] = [
      pointIndex === 0 ? cursor : room[wallIndex][0],
      pointIndex === 1 ? cursor : room[wallIndex][1],
    ];

    // Assign the correctly typed tuple back
    room[wallIndex] = updatedWall;

    // Do NOT update adjacent walls to allow dis-jointing at endpoint

    updatedRooms[roomIndex] = room;
    setRooms(updatedRooms);
  };

  // Right click handler
  const handleRightClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const handlePointerOver = (e: MouseEvent, wallData?: ActiveWallData) => {
    if (!wallData) return;
    if (cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    if (!activeWall) setCursor(CursorTypes.GRAB);
  };

  const handlePointerOut = () => {
    if (activeWall) return;
    setCursor(CursorTypes.POINTER);
    setActiveWall(null);
  };

  const handlers = {
    handlePointerDown,
    handleRightClick,
    handlePointerOver,
    handlePointerOut,
    handlePointerMove,
    handlePointerUp,
  };

  return (
    <ToolInputProvider value={handlers}>
      {children}
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={'lightblue'} />
      </mesh>
    </ToolInputProvider>
  );
}
