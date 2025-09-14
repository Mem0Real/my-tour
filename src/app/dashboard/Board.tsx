'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useAtomValue, useAtom } from 'jotai';

import { insertAtom } from '@/utils/atoms/ui';
import { isDrawingAtom, wallsAtom } from '@/utils/atoms/drawing';
import { Wall } from '@/3D/components/Wall';
import { straighten } from '@/3D/helpers/snapHelper';

const WALL_THICKNESS = 0.1;
const WALL_HEIGHT = 2.5;
const SNAP_DISTANCE = 0.3; // distance to auto-close loop
const STRAIGHT_THRESHOLD = 0.1;

export const Board = () => {
  const [hovered, setHovered] = useState(false);

  const insert = useAtomValue(insertAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [walls, setWalls] = useAtom(wallsAtom);

  // Current drawing loop
  const [currentLoop, setCurrentLoop] = useState<THREE.Vector3[]>([]);
  const [previewPoint, setPreviewPoint] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (insert === 'wall' && hovered) {
      document.body.style.cursor = 'url("/pencil.svg")0 24, auto';
    } else {
      document.body.style.cursor = 'auto';
    }
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

    const clicked = e.point.clone();
    clicked.y = 0;

    if (!isDrawing) {
      // First click starts drawing
      setCurrentLoop([clicked]);
      setIsDrawing(true);
      return;
    }

    const firstPoint = currentLoop[0];
    const lastPoint = currentLoop[currentLoop.length - 1];

    const snapped = straighten(lastPoint, clicked, STRAIGHT_THRESHOLD);

    // Check auto-close loop
    if (snapped.distanceTo(firstPoint) < SNAP_DISTANCE && currentLoop.length > 2) {
      const newWalls = currentLoop
        .slice(0)
        .map((p, i) => [p, currentLoop[(i + 1) % currentLoop.length]] as [THREE.Vector3, THREE.Vector3]);

      setWalls([...walls, ...newWalls]);

      // Reset for next room
      setCurrentLoop([]);
      setPreviewPoint(null);
      setIsDrawing(false);
      return;
    }

    // Otherwise, add a new wall segment
    setCurrentLoop([...currentLoop, snapped]);
    setPreviewPoint(null);
  };

  const handleBoardMove = (e: any) => {
    if (!e.point || currentLoop.length === 0) return;
    const point = e.point.clone();
    point.y = 0;

    // Straighten preview
    const lastPoint = currentLoop[currentLoop.length - 1];
    setPreviewPoint(straighten(lastPoint, point, STRAIGHT_THRESHOLD));
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
        <Wall key={`wall-${i}`} start={start} end={end} thickness={WALL_THICKNESS} height={WALL_HEIGHT} />
      ))}

      {/* Render current walls with preview */}
      {currentLoop.map((start, i) => {
        const end = i === currentLoop.length - 1 ? previewPoint : currentLoop[i + 1];
        if (!end) return null;
        return (
          <Wall
            key={`current-${i}`}
            start={start}
            end={end}
            thickness={WALL_THICKNESS}
            height={WALL_HEIGHT}
            dashed
            color='lightblue'
          />
        );
      })}
    </>
  );
};
