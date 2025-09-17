'use client';

import React, { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

import { cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isDrawingAtom, loopsAtom, previewPointAtom, snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';

import { Children, LoopPoint } from '@/utils/definitions';
import { snapToPoints, straighten } from '@/3D/helpers/wallHelper';
import {
  CameraTypes,
  SNAP_DISTANCE,
  SNAP_TOLERANCE,
  STRAIGHT_THRESHOLD,
  WALL_HEIGHT,
  WALL_THICKNESS,
} from '@/utils/constants';

import { Wall } from '@/3D/dashboard/components/Wall';
import { LengthOverlay } from '@/3D/dashboard/components/LengthOverlay';

import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { Three } from '@/3D/base/Three';
import { WallChain } from '@/3D/dashboard/components/WallChain';

export const AddInterface = ({ children }: Children) => {
  const [loops, setLoops] = useAtom(loopsAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [previewPoint, setPreviewPoint] = useAtom(previewPointAtom);

  const insert = useAtomValue(insertAtom);
  const cameraType = useAtomValue(cameraTypeAtom);

  const setSnapCues = useSetAtom(snapCuesAtom);

  const [currentLoop, setCurrentLoop] = useState<LoopPoint[]>([]);
  const [dragging, setDragging] = useState(false);

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
  }, [currentLoop, isDrawing]);

  const handleRightClick = (e: any) => {
    if (e?.button === 2 && !e.repeat) setDragging(true);
  };

  const handlePointerUp = (e: any) => {
    if (e?.button === 2) setDragging(false);
  };

  const handleBoardClick = (e: any) => {
    if (!e || !e.point || e.button === 2 || insert !== 'Wall') return;
    if (cameraType === CameraTypes.PERSPECTIVE) return;

    let clicked = e.point.clone();
    clicked.y = 0;

    const allWalls = loops.flatMap((loop) =>
      loop.map((start, i) => [start, loop[(i + 1) % loop.length]] as [THREE.Vector3, THREE.Vector3])
    );

    const currentLoopPositions = currentLoop.map((p) => p.pos);
    const { snappedPoint, snappedWall } = snapToPoints(clicked, currentLoopPositions, allWalls, SNAP_TOLERANCE);

    const pointData: LoopPoint = {
      pos: snappedPoint.clone(), // Always clone!
      snappedWall,
    };

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
    const newPointData: LoopPoint = { pos: newPos.clone(), snappedWall: snappedWall || undefined };

    // _____ Auto-close conditions ______ //
    const nearFirstPoint = newPos.distanceTo(firstPoint.pos) < SNAP_DISTANCE && currentLoop.length > 2;
    const bothEndsSnapped = !!firstPoint.snappedWall && !!newPointData.snappedWall;

    // 1) Close if near first point (basic)
    if (nearFirstPoint) {
      const newLoopPoints = currentLoop.concat([newPointData]).map((p) => p.pos.clone());
      setLoops([...loops, newLoopPoints]);
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    } else if (bothEndsSnapped) {
      // 2) Close if first & new point are both snapped to walls (can be different)
      const newLoopPoints = currentLoop.concat([newPointData]).map((p) => p.pos.clone());
      setLoops([...loops, newLoopPoints]);
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    }

    // 3) Proceed normally
    setCurrentLoop([...currentLoop, newPointData]);
    setPreviewPoint(null);
  };

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!e?.point || dragging || !isDrawing) return;

      const cursor = e.point.clone();
      cursor.y = 0;

      // Get all existing wall segments from closed loops!
      const allWalls = loops.flatMap((loop) =>
        loop.map((start, i) => [start, loop[(i + 1) % loop.length]] as [THREE.Vector3, THREE.Vector3])
      );

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
    [isDrawing, dragging, currentLoop, loops, setPreviewPoint, setSnapCues]
  );

  const handlers = {
    onPointerDown: handleBoardClick,
    onPointerUp: handlePointerUp,
    onPointerMove: handlePointerMove,
    onRightClick: handleRightClick,
    onKeyDown: handleKeyDown,
  };

  const drawPoints: THREE.Vector3[] = currentLoop.map((p) => p.pos);
  if (previewPoint) drawPoints.push(previewPoint);

  return (
    <ToolInputProvider value={handlers}>
      {children}
      <WallChain points={drawPoints} thickness={WALL_THICKNESS} height={WALL_HEIGHT} color='white' closed={false} />
    </ToolInputProvider>
  );
};
