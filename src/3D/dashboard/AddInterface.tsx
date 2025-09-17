'use client';

import React, { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

import { cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isDrawingAtom, loopsAtom, previewPointAtom, snapCuesAtom, wallsAtom } from '@/utils/atoms/drawing';

import { Children, LoopPoint } from '@/utils/definitions';
import { computeWinding, snapToPoints, straighten } from '@/3D/helpers/wallHelper';
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
import { ThreeEvent } from '@react-three/fiber';

let lastClickTime = 0; // put this outside the component or in a ref

export const AddInterface = ({ children }: Children) => {
  // const [loops, setLoops] = useAtom(loopsAtom);
  const [walls, setWalls] = useAtom(wallsAtom);

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

  useEffect(() => {
    console.log('[AddInterface] Load');
  }, []);

  const handleRightClick = (e: any) => {
    if (e?.button === 2 && !e.repeat) setDragging(true);
  };

  const handlePointerUp = (e: any) => {
    if (e?.button === 2) setDragging(false);
  };

  const handleBoardClick = (e: any) => {
    if (!e || !e.point || e.button === 2 || insert !== 'Wall') return;
    if (cameraType !== CameraTypes.ORTHOGRAPHIC && !e.shiftKey) return;

    let clicked = e.point.clone();
    clicked.y = 0;

    const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);

    const currentLoopPositions = currentLoop.map((p) => p.pos);
    const { snappedPoint, snappedWall } = snapToPoints(clicked, currentLoopPositions, allWalls, SNAP_TOLERANCE);

    const pointData: LoopPoint = { pos: snappedPoint.clone(), snappedWall };

    // Start drawing if not already
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

    const nearFirstPoint = newPos.distanceTo(firstPoint.pos) < SNAP_DISTANCE && currentLoop.length > 2;

    if (nearFirstPoint) {
      const newWalls = currentLoop
        .concat([newPointData])
        .map((p, i, arr) => [p.pos, arr[(i + 1) % arr.length].pos] as [THREE.Vector3, THREE.Vector3]);

      setWalls([...walls, ...newWalls]);

      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    }

    if (snappedWall) {
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

    // Otherwise, just continue adding points
    setCurrentLoop([...currentLoop, newPointData]);
    setPreviewPoint(null);
  };

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!e?.point || dragging || !isDrawing) return;
      if (cameraType !== CameraTypes.ORTHOGRAPHIC && !e.shiftKey) return;

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
    [isDrawing, dragging, currentLoop, walls, setPreviewPoint, setSnapCues]
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

  const winding = computeWinding(currentLoop.map((p) => p.pos));

  return (
    <ToolInputProvider value={handlers}>
      {children}
      {currentLoop.map((pointData, i) => {
        const start = pointData.pos;
        const end = i === currentLoop.length - 1 ? previewPoint : currentLoop[i + 1].pos;

        if (!end) return null;

        // Determine prevDir for the offset logic
        const prevDir =
          i > 0
            ? new THREE.Vector3()
                .subVectors(start, currentLoop[i - 1].pos)
                .setY(0)
                .normalize()
            : null;
        const nextDir =
          i < currentLoop.length - 1
            ? new THREE.Vector3()
                .subVectors(currentLoop[i + 2]?.pos || end, end)
                .setY(0)
                .normalize()
            : null;

        return (
          <React.Fragment key={`current-${i}`}>
            <Wall
              id={i}
              start={start}
              end={end}
              thickness={WALL_THICKNESS}
              height={WALL_HEIGHT}
              color='white'
              prevDir={prevDir}
              nextDir={nextDir}
            />
            {i === currentLoop.length - 1 && previewPoint && (
              <LengthOverlay start={start} end={previewPoint} thickness={WALL_THICKNESS} visible />
            )}
          </React.Fragment>
        );
      })}
    </ToolInputProvider>
  );
};
