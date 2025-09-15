'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { useAtomValue, useAtom } from 'jotai';
import { insertAtom } from '@/utils/atoms/ui';
import { isDrawingAtom, wallsAtom } from '@/utils/atoms/drawing';

import { Wall } from '@/3D/components/Wall';
import { LengthOverlay } from '@/3D/components/LengthOverlay';
import { SnapCues } from '@/3D/components/SnapCues';

import { straighten, snapToPoints } from '@/3D/helpers/snapHelper';
import { LoopPoint } from '@/utils/definitions';

const WALL_THICKNESS = 0.1;
const WALL_HEIGHT = 2.5;
const SNAP_DISTANCE = 0.3; // auto-close loop distance
const STRAIGHT_THRESHOLD = 0.1;
const SNAP_TOLERANCE = 0.3;
const SNAP_CUE_SIZE = 0.15;

export const Board = () => {
  const [hovered, setHovered] = useState(false);

  const insert = useAtomValue(insertAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [walls, setWalls] = useAtom(wallsAtom);

  const [currentLoop, setCurrentLoop] = useState<LoopPoint[]>([]);
  const [previewPoint, setPreviewPoint] = useState<THREE.Vector3 | null>(null);
  const [snapCues, setSnapCues] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    document.body.style.cursor = insert === 'wall' && hovered ? 'url("/pencil.svg")0 24, auto' : 'auto';
  }, [insert, hovered]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentLoop([]);
        setPreviewPoint(null);
        setIsDrawing(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleRightClick = (e: any) => e.stopPropagation();

  const handleBoardClick = (e: any) => {
    if (!e.point || e.button === 2 || insert !== 'wall') return;

    let clicked = e.point.clone();
    clicked.y = 0;

    const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);

    // Pass an array of Vector3 to snapToPoints
    const currentLoopPositions = currentLoop.map((p) => p.pos);
    const { snappedPoint, snappedWall } = snapToPoints(clicked, currentLoopPositions, allWalls, SNAP_TOLERANCE);

    const newPointData: LoopPoint = {
      pos: snappedPoint,
      snappedWall: snappedWall || undefined,
    };

    if (!isDrawing) {
      // Start new loop
      setCurrentLoop([newPointData]);
      setIsDrawing(true);
      setPreviewPoint(null);
      return;
    }

    const firstPoint = currentLoop[0];
    const lastPoint = currentLoop[currentLoop.length - 1];

    // Straighten relative to last point
    newPointData.pos = straighten(lastPoint.pos, snappedPoint, STRAIGHT_THRESHOLD);

    // Auto-close if near first point or both ends snapped to walls
    const bothEndsSnapped = !!firstPoint.snappedWall && !!newPointData.snappedWall;

    if ((newPointData.pos.distanceTo(firstPoint.pos) < SNAP_DISTANCE && currentLoop.length > 2) || bothEndsSnapped) {
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

  const handleBoardMove = (e: any) => {
    if (!e.point || !isDrawing) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    // Flatten wall points
    const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);

    // Snap cursor to first point axis + other walls
    const { snappedPoint } = snapToPoints(
      cursor,
      currentLoop.map((p) => p.pos),
      allWalls,
      SNAP_TOLERANCE
    );

    // Straighten relative to last point
    if (currentLoop.length > 0) {
      const lastPoint = currentLoop[currentLoop.length - 1];
      setPreviewPoint(straighten(lastPoint.pos, snappedPoint, STRAIGHT_THRESHOLD));
    } else setPreviewPoint(snappedPoint);

    // setSnapCues([snapped]);
  };

  return (
    <>
      {/* Invisible plane for raycast */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handleBoardClick}
        onPointerMove={handleBoardMove}
        onContextMenu={handleRightClick}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Render finalized walls */}
      {walls.map(([start, end], i) => (
        <React.Fragment key={`wall-${i}`}>
          <Wall start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} />
          <LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />
        </React.Fragment>
      ))}

      {/* Render current walls with preview */}
      {currentLoop.map((pointData, i) => {
        const start = pointData.pos;
        const end = i === currentLoop.length - 1 ? previewPoint : currentLoop[i + 1].pos;

        if (!end) return null;

        return (
          <React.Fragment key={`current-${i}`}>
            <Wall start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} dashed color='lightblue' />
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
