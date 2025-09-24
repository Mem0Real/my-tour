'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { cameraTypeAtom, cursorTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes, CursorTypes } from '@/utils/constants';
import { Children, ActiveWallData } from '@/utils/definitions';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeEndpointAtom, activeWallAtom, pointsAtom, roomsAtom } from '@/utils/atoms/drawing';
import { ThreeEvent } from '@react-three/fiber';
import { getColinearChain } from '@/3D/helpers/wallHelper';

export function EditInterface({ children }: Children) {
  const [initialCursorPos, setInitialCursorPos] = useState<THREE.Vector3 | null>(null);
  const [chain, setChain] = useState<number[]>([]);
  const [initialChainPositions, setInitialChainPositions] = useState<THREE.Vector3[]>([]);
  const [initialPoints, setInitialPoints] = useState<THREE.Vector3[]>([]); // Snapshot of all points

  const [points, setPoints] = useAtom(pointsAtom);
  const [rooms, setRooms] = useAtom(roomsAtom);
  const [activeWall, setActiveWall] = useAtom(activeWallAtom);
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

    const chainPoints = getColinearChain(rooms, points, wallData);
    setChain(chainPoints);
    setInitialChainPositions(chainPoints.map((idx) => points[idx].clone()));
    setInitialPoints(points.map((p) => p.clone())); // Store initial state of all points

    setCursor(CursorTypes.GRABBING);
  };

  // Release
  const handlePointerUp = () => {
    if (!activeWall) return;

    setActiveWall(null);
    setCursor((prev) => (prev === CursorTypes.GRABBING ? CursorTypes.GRAB : CursorTypes.POINTER));
    setChain([]);
    setInitialChainPositions([]);
    setInitialPoints([]);

    setActiveEndpoint(null);
  };

  // Move
  const handlePointerMove = (e: ThreeEvent<MouseEvent>) => {
    if (!e.point || cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    if (activeWall) {
      handleWallMove(cursor, e);
    } else if (activeEndpoint) {
      handleEndpointMove(cursor);
    }
  };

  // Move whole wall (chain) with axis lock and slide connected walls
  const handleWallMove = (cursor: THREE.Vector3, e: ThreeEvent<MouseEvent>) => {
    if (!activeWall || !initialCursorPos || chain.length === 0 || initialPoints.length === 0) return;

    // Calculate delta relative to initial cursor position
    const delta = new THREE.Vector3(cursor.x - initialCursorPos.x, 0, cursor.z - initialCursorPos.z);

    // Determine direction from overall chain
    const overallStart = initialChainPositions[0];
    const overallEnd = initialChainPositions[initialChainPositions.length - 1];
    const wallDir = new THREE.Vector3().subVectors(overallEnd, overallStart).setY(0).normalize();
    const isHorizontal = Math.abs(wallDir.x) > Math.abs(wallDir.z);

    // Lock movement to appropriate axis
    const lockedDelta = new THREE.Vector3(isHorizontal ? 0 : delta.x, 0, isHorizontal ? delta.z : 0);

    // Find connected walls with the same direction
    const connectedPoints = new Set<number>(chain);
    const updatedPoints = [...points];

    // Update chain points based on initial positions plus current delta
    chain.forEach((idx, i) => {
      const init = initialChainPositions[i];
      updatedPoints[idx] = new THREE.Vector3().addVectors(init, lockedDelta);
    });

    // Update connected walls' start and end points with the same direction
    rooms.forEach((room, rIdx) => {
      const rLen = room.length;
      for (let sIdx = 0; sIdx < rLen; sIdx++) {
        const startIdx = room[sIdx];
        const endIdx = room[(sIdx + 1) % rLen];
        const segDir = new THREE.Vector3().subVectors(points[endIdx], points[startIdx]).setY(0).normalize();
        const angle = wallDir.angleTo(segDir);
        const revAngle = wallDir.angleTo(segDir.clone().negate());

        if ((angle < 1e-2 || revAngle < 1e-2) && (connectedPoints.has(startIdx) || connectedPoints.has(endIdx))) {
          // Same direction, update both points using initial positions
          updatedPoints[startIdx] = new THREE.Vector3().addVectors(initialPoints[startIdx], lockedDelta);
          updatedPoints[endIdx] = new THREE.Vector3().addVectors(initialPoints[endIdx], lockedDelta);
        }
      }
    });

    setPoints(updatedPoints);
  };

  // Move a single endpoint independently (dis-joint) - assuming endpoint handlers set activeEndpoint
  const handleEndpointMove = (cursor: THREE.Vector3) => {
    if (!activeEndpoint) return;

    const { roomIndex, wallIndex, isStart } = activeEndpoint;
    const room = rooms[roomIndex];
    if (!room) return;

    const pointSlot = isStart ? wallIndex : (wallIndex + 1) % room.length;
    let pointIdx = room[pointSlot];

    // Duplicate point to dis-joint if shared (degree > 1)
    const degree = rooms.flatMap((r) => r).filter((idx) => idx === pointIdx).length;
    if (degree > 1) {
      const newIdx = points.length;
      setPoints((prev) => [...prev, points[pointIdx].clone()]);

      const updatedRoom = [...room];
      updatedRoom[pointSlot] = newIdx;
      const updatedRooms = [...rooms];
      updatedRooms[roomIndex] = updatedRoom;
      setRooms(updatedRooms);

      pointIdx = newIdx;
    }

    // Update position
    const updatedPoints = [...points];
    updatedPoints[pointIdx].copy(cursor);
    setPoints(updatedPoints);
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

  return <ToolInputProvider value={handlers}>{children}</ToolInputProvider>;
}
