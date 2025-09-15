'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

import { useAtomValue, useAtom } from 'jotai';
import { insertAtom } from '@/utils/atoms/ui';
import { isDrawingAtom, wallsAtom } from '@/utils/atoms/drawing';

import { Wall } from '@/3D/components/Wall';
import { LengthOverlay } from '@/3D/components/LengthOverlay';

import { straighten, snapToPoints } from '@/3D/helpers/snapHelper';

const WALL_THICKNESS = 0.1;
const WALL_HEIGHT = 2.5;
const SNAP_DISTANCE = 0.3; // auto-close loop distance
const STRAIGHT_THRESHOLD = 0.1;
const SNAP_TOLERANCE = 0.3;

export const Board = () => {
  const [hovered, setHovered] = useState(false);

  const insert = useAtomValue(insertAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [walls, setWalls] = useAtom(wallsAtom);

  const [currentLoop, setCurrentLoop] = useState<THREE.Vector3[]>([]);
  const [previewPoint, setPreviewPoint] = useState<THREE.Vector3 | null>(null);

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

  const handleBoardMove = (e: any) => {
    if (!e.point || !isDrawing) return;

    const cursor = e.point.clone();
    cursor.y = 0;

    // Flatten wall points
    const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);

    // Snap cursor to first point axis + other walls
    let snapped = snapToPoints(cursor, currentLoop, allWalls, SNAP_TOLERANCE);

    // Straighten relative to last point
    if (currentLoop.length > 0) {
      const lastPoint = currentLoop[currentLoop.length - 1];
      snapped = straighten(lastPoint, snapped, STRAIGHT_THRESHOLD);
    }

    setPreviewPoint(snapped);
  };

  const handleBoardClick = (e: any) => {
    if (!e.point || e.button === 2 || insert !== 'wall') return;

    // Use already previewed point if it exists to avoid off-click issues
    const newPoint = previewPoint
      ? previewPoint.clone()
      : (() => {
          const clicked = e.point.clone();
          clicked.y = 0;

          const allWalls = walls.map(([start, end]) => [start, end] as [THREE.Vector3, THREE.Vector3]);
          let snapped = snapToPoints(clicked, currentLoop, allWalls, SNAP_TOLERANCE);

          if (currentLoop.length > 0) {
            const lastPoint = currentLoop[currentLoop.length - 1];
            snapped = straighten(lastPoint, snapped, STRAIGHT_THRESHOLD);
          }
          return snapped;
        })();

    if (!isDrawing) {
      setCurrentLoop([newPoint]);
      setIsDrawing(true);
      setPreviewPoint(null);
      return;
    }

    const firstPoint = currentLoop[0];

    // Auto-close loop if near first point
    if (newPoint.distanceTo(firstPoint) < SNAP_DISTANCE && currentLoop.length > 2) {
      const newWalls = currentLoop
        .slice(0)
        .map((p, i) => [p, currentLoop[(i + 1) % currentLoop.length]] as [THREE.Vector3, THREE.Vector3]);

      setWalls([...walls, ...newWalls]);
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    }

    setCurrentLoop([...currentLoop, newPoint]);
    setPreviewPoint(null);
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
      {currentLoop.map((start, i) => {
        const end = i === currentLoop.length - 1 ? previewPoint : currentLoop[i + 1];
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
    </>
  );
};
