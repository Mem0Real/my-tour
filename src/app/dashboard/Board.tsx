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
import { EndpointRef, LoopPoint } from '@/utils/definitions';

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

  const [isShiftDown, setIsShiftDown] = useState(false);

  const [editingEndPoint, setEditingPoint] = useState<EndpointRef | null>(null);
  const [hoveredEndpoint, setHoveredEndpoint] = useState<EndpointRef | null>(null);

  // Cursor change
  useEffect(() => {
    document.body.style.cursor = insert === 'wall' && hovered ? 'url("/pencil.svg")0 24, auto' : 'auto';
  }, [insert, hovered]);

  // Esc exit current editing wall
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setCurrentLoop([]);
          setPreviewPoint(null);
          setIsDrawing(false);
          break;
        case 'Shift':
          setIsShiftDown(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftDown(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleRightClick = (e: any) => e.stopPropagation();

  const handleBoardClick = (e: any) => {
    if (!e.point || e.button === 2 || insert !== 'wall') return;

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

    if (editingEndPoint) {
      const updatedWalls = [...walls];
      const [start, end] = updatedWalls[editingEndPoint.wallIndex];

      updatedWalls[editingEndPoint.wallIndex] = editingEndPoint.pointIndex === 0 ? [cursor, end] : [start, cursor];

      setWalls(updatedWalls);
      return;
    }

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

  const handleEndpointClick = (wallIndex: number, pointIndex: 0 | 1) => {
    if (!isShiftDown || editingEndPoint) return;

    setEditingPoint({ wallIndex: wallIndex, pointIndex: pointIndex });
    // else handleBoardClick();
  };

  const handlePointerUp = (e: any) => {
    if (editingEndPoint) {
      setEditingPoint(null);
    }
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
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={handleRightClick}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Render finalized walls */}
      {walls.map(([start, end], i) => (
        <React.Fragment key={`wall-${i}`}>
          <Wall
            id={i}
            start={start}
            end={end}
            thickness={WALL_THICKNESS}
            height={WALL_HEIGHT}
            onHoverEndpoint={setHoveredEndpoint}
            onClickEndpoint={({ wallIndex, pointIndex }) => handleEndpointClick(wallIndex, pointIndex)}
            hoveredEndpoint={hoveredEndpoint}
          />
          {<LengthOverlay start={start} end={end} thickness={WALL_THICKNESS} />}
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
