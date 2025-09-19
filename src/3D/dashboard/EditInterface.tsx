'use client';

import React, { useCallback, useEffect, useState } from 'react';

import * as THREE from 'three';

import { Three } from '@/3D/base/Three';
import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { cursorTypeAtom } from '@/utils/atoms/ui';
import { CursorTypes, SNAP_TOLERANCE } from '@/utils/constants';
import { Children, WallData } from '@/utils/definitions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeWallAtom, wallsAtom } from '@/utils/atoms/drawing';
import { ThreeEvent } from '@react-three/fiber';

export function EditInterface({ children }: Children) {
  const [walls, setWalls] = useAtom(wallsAtom);
  const [activeWall, setActiveWall] = useAtom(activeWallAtom);
  const [initialPos, setInitialPos] = useState<THREE.Vector3 | null>(null);

  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    setCursor(CursorTypes.POINTER);
  }, []);

  const handlePointerDown = (e: ThreeEvent<MouseEvent>, wallData?: WallData) => {
    if (!wallData || !e.point || e.button === 2) return;

    setActiveWall(wallData);
    setInitialPos(e.point.clone());
  };

  const handlePointerUp = () => {
    if (!activeWall) return;

    setCursor(CursorTypes.POINTER);
    setActiveWall(null);
  };

  const handlePointerMove = (e: ThreeEvent<MouseEvent>) => {
    if (!e?.point || !activeWall || !initialPos) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    const updatedWalls = [...walls];

    const wallIdx = updatedWalls.findIndex((_, i) => i === activeWall.id);

    /* TODO Find connected points & update them as well. For now, I'm using index but that wont cover all basis */

    const width = Math.abs(activeWall.start.x - activeWall.end.x);
    const height = Math.abs(activeWall.start.z - activeWall.end.z);

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

  // Accidentally might have figured out joint drag (not quite though)
  const handleJointMove = (e: ThreeEvent<MouseEvent>) => {
    if (!e?.point || !activeWall || !initialPos) return;

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

  const handleRightClick = (e: MouseEvent) => {
    e.stopPropagation();
    console.log('Html onClick', e);
  };

  const handlePointerOver = (e: MouseEvent, wallData?: WallData) => {
    if (!wallData) return;

    const { start, end } = wallData;

    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const isHorizontal = Math.abs(dir.x) > Math.abs(dir.z);

    setCursor(isHorizontal ? CursorTypes.UPDOWN : CursorTypes.LEFTRIGHT);
    // setActiveWall((prev) => (prev?.id === wallData.id ? null : wallData));
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
