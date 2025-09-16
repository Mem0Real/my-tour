'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { cameraTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { useAtom, useAtomValue } from 'jotai';
import { isDrawingAtom, wallsAtom } from '@/utils/atoms/drawing';
import { LoopPoint } from '@/utils/definitions';
import { snapToPoints, straighten } from '@/3D/helpers/wallHelper';
import { CameraTypes } from '@/utils/constants';
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
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing && currentLoop.length > 0) {
        setCurrentLoop((prev) => prev.slice(0, -1));
        setPreviewPoint(null);
        if (currentLoop.length <= 1) setIsDrawing(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLoop]);

  const handleRightClick = (e: any) => {
    if (e.button === 2 && !e.repeat) setDragging(true);
  };

  const handlePointerUp = (e: any) => {
    if (e.button === 2) setDragging(false);
  };

  const handleBoardClick = (e: any) => {
    if (!e.point || e.button === 2 || !insert || cameraType === CameraTypes.PERSPECTIVE) return;

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
    const newPos = straighten(lastPoint.pos, snappedPoint, STRAIGHT_THRESHOLD);
    const newPointData: LoopPoint = { pos: newPos, snappedWall: snappedWall || undefined };

    const nearFirstPoint = newPos.distanceTo(firstPoint.pos) < SNAP_DISTANCE && currentLoop.length > 2;
    const bothEndsSnapped = !!firstPoint.snappedWall && !!newPointData.snappedWall;

    if (nearFirstPoint || bothEndsSnapped) {
      const newWalls = currentLoop
        .concat([newPointData])
        .map((p, i, arr) => [p.pos, arr[(i + 1) % arr.length].pos] as [THREE.Vector3, THREE.Vector3]);

      setWalls([...walls, ...newWalls]);
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    }

    setCurrentLoop([...currentLoop, newPointData]);
    setPreviewPoint(null);
  };

  const handlePointerMove = (e: any) => {
    if (!e.point || dragging || !isDrawing) return;

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
  };

  return (
    <>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        onPointerDown={(e) => {
          handleBoardClick(e);
          handleRightClick(e);
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Finalized walls */}
      {walls.map(([start, end], i) => (
        <React.Fragment key={`wall-${i}`}>
          <Wall id={i} start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} color='white' visible />
          {cameraType === CameraTypes.ORTHOGRAPHIC && (
            <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
          )}
        </React.Fragment>
      ))}

      {/* Preview walls */}
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
              color='lightblue'
              visible={currentLoop[i + 2] ? true : false}
            />
            {i === currentLoop.length - 1 && previewPoint && (
              <LengthOverlay start={start} end={previewPoint} thickness={WALL_THICKNESS} visible />
            )}
          </React.Fragment>
        );
      })}

      {/* Snap cues */}
      <SnapCues points={snapCues} />
    </>
  );
};
