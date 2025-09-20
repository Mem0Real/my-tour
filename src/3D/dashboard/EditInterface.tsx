'use client';

import React, { useCallback, useEffect, useState } from 'react';

import * as THREE from 'three';

import { Three } from '@/3D/base/Three';
import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { cameraTypeAtom, cursorTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes, CursorTypes, SNAP_TOLERANCE } from '@/utils/constants';
import { Children, WallData } from '@/utils/definitions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeWallAtom, wallsAtom } from '@/utils/atoms/drawing';
import { ThreeEvent } from '@react-three/fiber';

export function EditInterface({ children }: Children) {
  const [initialCursorPos, setInitialCursorPos] = useState<THREE.Vector3 | null>(null);
  const [initialWallPos, setInitialWallPos] = useState<[THREE.Vector3, THREE.Vector3] | []>([]);

  const [walls, setWalls] = useAtom(wallsAtom);
  const [activeWall, setActiveWall] = useAtom(activeWallAtom);

  const cameraType = useAtomValue(cameraTypeAtom);
  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    setCursor(CursorTypes.POINTER);
  }, []);

  // Click
  const handlePointerDown = (e: ThreeEvent<MouseEvent>, wallData?: WallData) => {
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
  };

  // Move
  const handlePointerMove = (e: ThreeEvent<MouseEvent>) => {
    if (!e?.point || !activeWall || !initialCursorPos) return;
    if (cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    const updatedWalls = [...walls];
    const wallIdx = updatedWalls.findIndex((_, i) => i === activeWall.id);
    const currentWall = updatedWalls[wallIdx];

    const initStart = initialWallPos[0]!;
    const initEnd = initialWallPos[1]!;

    // Calculate wall direction vector, ignore Y
    const wallDir = new THREE.Vector3().subVectors(initEnd, initStart).setY(0);
    const isHorizontal = Math.abs(wallDir.x) > Math.abs(wallDir.z);

    // Calculate the movement delta vector from initial cursor position
    const delta = new THREE.Vector3(cursor.x - initialCursorPos.x, 0, cursor.z - initialCursorPos.z);

    // New positions for start and end, initialized to initial ones
    let newStart = initStart.clone();
    let newEnd = initEnd.clone();

    if (isHorizontal) {
      // Snap X to original X (can't move horizontally), allow free movement on Z axis
      newStart.x = initStart.x;
      newEnd.x = initEnd.x;

      newStart.z += delta.z;
      newEnd.z += delta.z;
    } else {
      // Vertical wall: Snap Z to original Z (can't move vertically), allow free movement on X axis
      newStart.z = initStart.z;
      newEnd.z = initEnd.z;

      newStart.x += delta.x;
      newEnd.x += delta.x;
    }

    // Update the wall positions
    updatedWalls[wallIdx] = [newStart, newEnd];

    // Also update connected walls' endpoints to keep continuity if needed
    if (wallIdx === 0) {
      updatedWalls[updatedWalls.length - 1][1] = newStart.clone();
    }
    if (wallIdx === updatedWalls.length - 1) {
      updatedWalls[0][0] = newEnd.clone();
    }
    if (wallIdx > 0 && updatedWalls[wallIdx - 1]?.length === 2) {
      updatedWalls[wallIdx - 1][1] = newStart.clone();
    }
    if (wallIdx < updatedWalls.length - 1 && updatedWalls[wallIdx + 1]?.length === 2) {
      updatedWalls[wallIdx + 1][0] = newEnd.clone();
    }

    setWalls(updatedWalls);
  };

  // Accidentally might have figured out joint drag (not quite though)
  const handleJointMove = (e: ThreeEvent<MouseEvent>) => {
    if (!e?.point || !activeWall || !initialCursorPos) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    const width = Math.abs(activeWall.start.x - activeWall.end.x);
    const height = Math.abs(activeWall.start.z - activeWall.end.z);

    const updatedWalls = [...walls];
    const wallIdx = updatedWalls.findIndex((_, i) => i === activeWall.id);

    updatedWalls[wallIdx].map((wall) => {
      wall.x = cursor.x + width / 2;
      wall.z = cursor.z + height / 2;
    });

    const currentWall = updatedWalls[wallIdx];

    if (updatedWalls[wallIdx - 1]?.length > 1) {
      updatedWalls[wallIdx - 1][1].x = currentWall[1].x;
      updatedWalls[wallIdx - 1][1].z = currentWall[1].z;
    }

    if (updatedWalls[wallIdx + 1]?.length > 1) {
      updatedWalls[wallIdx + 1][0].x = currentWall[0].x;
      updatedWalls[wallIdx + 1][0].z = currentWall[0].z;
    }

    setWalls(updatedWalls);
  };

  // RMB
  const handleRightClick = (e: MouseEvent) => {
    e.stopPropagation();
    console.log('Html onClick', e);
  };

  // Move
  const handlePointerOver = (e: MouseEvent, wallData?: WallData) => {
    if (!wallData) return;
    if (cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    const { start, end } = wallData;

    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const isHorizontal = Math.abs(dir.x) > Math.abs(dir.z);

    !activeWall && setCursor(CursorTypes.GRAB);
    // setCursor(isHorizontal ? CursorTypes.UPDOWN : CursorTypes.LEFTRIGHT);
    // setActiveWall((prev) => (prev?.id === wallData.id ? null : wallData));
  };

  // Hover out
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
