'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { Sidebar } from '@/app/dashboard/components/Sidebar';
import { cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { useAtom, useAtomValue } from 'jotai';
import { isDrawingAtom, wallsAtom } from '@/utils/atoms/drawing';
import { LoopPoint } from '@/utils/definitions';
import { snapToPoints, straighten } from '@/3D/helpers/snapHelper';
import { CameraTypes } from '@/utils/constants';
import { Three } from '@/3D/base/Three';
import { Wall } from '@/3D/dashboard/Wall';
import { LengthOverlay } from '@/3D/dashboard/LengthOverlay';
import { SnapCues } from '@/3D/dashboard/SnapCues';

const WALL_THICKNESS = 0.1;
const WALL_HEIGHT = 2.5;
const SNAP_DISTANCE = 0.3;
const STRAIGHT_THRESHOLD = 0.1;
const SNAP_TOLERANCE = 0.3;

export const AddInterface = () => {
  const insert = useAtomValue(insertAtom);
  const cameraType = useAtomValue(cameraTypeAtom);

  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [walls, setWalls] = useAtom(wallsAtom);

  const [currentLoop, setCurrentLoop] = useState<LoopPoint[]>([]);
  const [previewPoint, setPreviewPoint] = useState<THREE.Vector3 | null>(null);
  const [snapCues, setSnapCues] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isDrawing && currentLoop.length > 0) {
            setCurrentLoop((prev) => prev.slice(0, -1));
            setPreviewPoint(null);
            if (currentLoop.length <= 1) setIsDrawing(false);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentLoop]);

  const handleBoardClick = (e: any) => {
    if (!e.point || e.button === 2 || !insert) return;
    if (cameraType === CameraTypes.PERSPECTIVE) return;

    let clicked = e.point.clone();
    clicked.y = 0;

    const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);

    const currentLoopPositions = currentLoop.map((p) => p.pos);
    const { snappedPoint, snappedWall } = snapToPoints(clicked, currentLoopPositions, allWalls, SNAP_TOLERANCE);

    const pointData: LoopPoint = {
      pos: snappedPoint,
      snappedWall,
    };

    if (!isDrawing) {
      // Start new loop
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

    // 3) Proceed normally
    setCurrentLoop([...currentLoop, newPointData]);
    setPreviewPoint(null);
  };

  const handlePointerMove = (e: any) => {
    if (!e.point) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    // --- DRAWING ---
    if (isDrawing) {
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
    }
  };

  return (
    <>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        onPointerDown={handleBoardClick}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Render finalized walls */}
      {walls.map(([start, end], i) => (
        <React.Fragment key={`wall-${i}`}>
          <Wall id={i} start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} color={'white'} />

          {cameraType === CameraTypes.ORTHOGRAPHIC && (
            <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
          )}
        </React.Fragment>
      ))}

      {/* Render current walls with preview */}
      {currentLoop.map((pointData, i) => {
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
              dashed
              color='lightblue'
            />
            {i === currentLoop.length - 1 && previewPoint && (
              <LengthOverlay start={start} end={previewPoint} thickness={WALL_THICKNESS} visible />
            )}
          </React.Fragment>
        );
      })}

      {/* Snap Cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
