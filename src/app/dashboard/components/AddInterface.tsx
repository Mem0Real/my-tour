'use client';

import React, { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

import { cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isDrawingAtom, previewPointAtom, snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';

import { LoopPoint } from '@/utils/definitions';
import { snapToPoints, straighten } from '@/3D/helpers/wallHelper';
import {
  CameraTypes,
  SNAP_DISTANCE,
  SNAP_TOLERANCE,
  STRAIGHT_THRESHOLD,
  WALL_HEIGHT,
  WALL_THICKNESS,
} from '@/utils/constants';
import { Wall } from '@/3D/dashboard/Wall';
import { LengthOverlay } from '@/3D/dashboard/LengthOverlay';

import {
  onPointerDownAtom,
  onPointerMoveAtom,
  onPointerUpAtom,
  onRightClick,
  onKeyDownAtom,
} from '@/utils/atoms/sceneHandlers';

export const AddInterface = () => {
  const [walls, setWalls] = useAtom(wallsAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [previewPoint, setPreviewPoint] = useAtom(previewPointAtom);

  const insert = useAtomValue(insertAtom);
  const cameraType = useAtomValue(cameraTypeAtom);

  const setSnapCues = useSetAtom(snapCuesAtom);

  const [currentLoop, setCurrentLoop] = useState<LoopPoint[]>([]);
  const [dragging, setDragging] = useState(false);

  const setPointerDown = useSetAtom(onPointerDownAtom);
  const setPointerMove = useSetAtom(onPointerMoveAtom);
  const setPointerUp = useSetAtom(onPointerUpAtom);
  const setRightClick = useSetAtom(onRightClick);
  const setKeyDown = useSetAtom(onKeyDownAtom);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isDrawing && currentLoop.length > 0) {
      setCurrentLoop((prev) => prev.slice(0, -1));
      setPreviewPoint(null);
      if (currentLoop.length <= 1) setIsDrawing(false);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLoop]);

  const handleRightClick = (e: any) => {
    if (e?.button === 2 && !e.repeat) setDragging(true);
  };

  const handlePointerUp = (e: any) => {
    if (e?.button === 2) setDragging(false);
  };

  const handleBoardClick = (e: any) => {
    if (!e?.point || e?.button === 2 || !insert || cameraType === CameraTypes.PERSPECTIVE) return;

    const clicked = e.point.clone();
    clicked.y = 0;

    const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);
    const currentLoopPositions = currentLoop.map((p) => p.pos);
    const { snappedPoint, snappedWall } = snapToPoints(clicked, currentLoopPositions, allWalls, SNAP_TOLERANCE);

    const pointData: LoopPoint = { pos: snappedPoint, snappedWall };

    if (!isDrawing) {
      setCurrentLoop([pointData]);
      setIsDrawing(true);
      setPreviewPoint(null);
      return;
    }

    const firstPoint = currentLoop[0];
    const lastPoint = currentLoop[currentLoop.length - 1];

    // Straighten relative to last point
    const newPos = straighten(lastPoint.pos, snappedPoint, STRAIGHT_THRESHOLD);
    const newPointData: LoopPoint = { pos: newPos, snappedWall: snappedWall || undefined };

    // _____ Auto-close conditions ______ //
    const nearFirstPoint = newPos.distanceTo(firstPoint.pos) < SNAP_DISTANCE && currentLoop.length > 2;
    const bothEndsSnapped = !!firstPoint.snappedWall && !!newPointData.snappedWall;

    // 1) Close if near first point (basic)
    if (nearFirstPoint) {
      const newWalls = currentLoop
        .concat([newPointData])
        .map((p, i, arr) => [p.pos, arr[(i + 1) % arr.length].pos] as [THREE.Vector3, THREE.Vector3]);

      setWalls([...walls, ...newWalls]);
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    } else if (bothEndsSnapped) {
      // 2) Close if first & new point are both snapped to walls (can be different)
      const newWalls = currentLoop
        .concat([newPointData])
        .map((p, i, arr) => [p.pos, arr[i + 1]?.pos].filter(Boolean) as THREE.Vector3[])
        .filter((seg) => seg.length === 2) as [THREE.Vector3, THREE.Vector3][];

      setWalls([...walls, ...newWalls]);
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    }

    setCurrentLoop([...currentLoop, newPointData]);
    setPreviewPoint(null);
  };

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!e?.point || dragging || !isDrawing) return;

      const cursor = e.point.clone();
      cursor.y = 0;

      const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);
      const { snappedPoint } = snapToPoints(
        cursor,
        currentLoop.map((p) => p.pos),
        allWalls,
        SNAP_TOLERANCE
      );

      const lastPoint = currentLoop[currentLoop.length - 1];
      const straightened = straighten(lastPoint.pos, snappedPoint, STRAIGHT_THRESHOLD);

      setPreviewPoint(straightened);
      setSnapCues([snappedPoint]);
    },
    [isDrawing, dragging]
  );

  useEffect(() => {
    setPointerDown(() => handleBoardClick);
    setPointerMove(() => handlePointerMove);
    setPointerUp(() => handlePointerUp);
    setRightClick(() => handleRightClick);
    setKeyDown(() => handleKeyDown);

    return () => {
      // Clear handlers when unmounted
      setPointerDown(null);
      setPointerMove(null);
      setPointerUp(null);
      setRightClick(null);
      setKeyDown(null);
    };
  }, []);

  return currentLoop.map((pointData, i) => {
    const start = pointData.pos;
    const end = i === currentLoop.length - 1 ? previewPoint : currentLoop[i + 1].pos;
    if (!end) return null;

    return (
      <React.Fragment key={`current-${i}`}>
        <Wall
          id={i}
          start={start}
          end={end}
          thickness={WALL_THICKNESS}
          height={WALL_HEIGHT}
          color='lightblue'
          visible={currentLoop[i + 2] ? true : false}
        />
        {i === currentLoop.length - 1 && previewPoint && (
          <LengthOverlay start={start} end={previewPoint} thickness={WALL_THICKNESS} visible />
        )}
      </React.Fragment>
    );
  });
};
