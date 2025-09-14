'use client';

import * as THREE from 'three';
import { insertAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { isDrawingAtom, wallPointsAtom, previewPointAtom, wallsAtom } from '@/utils/atoms/drawing';

import { Wall } from '@/3D/components/Wall';
import { magneticSnap } from '@/3D/helpers/snapHelper';

export const Board = () => {
  const [hovered, setHovered] = useState(false);
  const [placement, setPlacement] = useState<THREE.Vector3 | undefined>();

  const insert = useAtomValue(insertAtom);

  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [points, setPoints] = useAtom(wallPointsAtom);
  const [walls, setWalls] = useAtom(wallsAtom);
  const [preview, setPreview] = useAtom(previewPointAtom);

  const SNAP_DISTANCE = 0.5; // tolerance for snapping to first point

  useEffect(() => {
    if (insert === 'wall' && hovered) {
      document.body.style.cursor = 'url("/pencil.svg") 4 30, auto';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [insert, hovered]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreview(null);
        setIsDrawing(false);
        setPoints([]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleRightClick = (e: any) => {
    e.stopPropagation();
  };

  const handleBoardClick = (e: any) => {
    if (insert !== 'wall') return;
    if (e.button === 2) return; // skip if RMB

    // const point = e.point.clone(); // 3D point on the board
    const point = magneticSnap(e.point, points[points.length - 1], points[0]);

    if (!isDrawing) {
      setPoints([point]);
      setIsDrawing(true);
    } else {
      const first = points[0];
      const last = points[points.length - 1];

      // Check if click is near first point -> close loop
      if (point.distanceTo(first) < SNAP_DISTANCE && points.length > 2) {
        // setWalls([...walls, ...points.map((p, i) => [p, points[(i + 1) % points.length]])]);

        const loopPoints = [...points, points[0]];
        const newWalls = loopPoints.slice(0, -1).map((p, i) => [loopPoints[i], loopPoints[i + 1]]);
        setWalls([...walls, ...newWalls]);

        setPoints([]);
        setPreview(null);
        setIsDrawing(false);
      } else {
        // Add wall from last -> new point
        setWalls([...walls, [last, point]]);
        setPoints([...points, point]);
      }
    }
  };

  const handleBoardMove = (e: any) => {
    // if (isDrawing) setPreview(e.point.clone());
    if (isDrawing) {
      const point = magneticSnap(e.point, points[points.length - 1], points[0]);
      setPreview(point);
    }

    if (insert === 'wall') setPlacement(e.point);
  };

  return (
    <>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={(e) => handleBoardClick(e)}
        onPointerMove={(e) => handleBoardMove(e)}
        onContextMenu={handleRightClick}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Finalized walls */}
      {walls.map(([a, b], i) => (
        <Wall key={i} start={a} end={b} />
      ))}

      {/* Active chain */}
      {points.map((p, i) => {
        if (i === points.length - 1 && preview) {
          return <Wall key={`preview-${i}`} start={p} end={preview} dashed />;
        }
        if (i < points.length - 1) {
          return <Wall key={`active-${i}`} start={p} end={points[i + 1]} dashed />;
        }
        return null;
      })}
    </>
  );
};
