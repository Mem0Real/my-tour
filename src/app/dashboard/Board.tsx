'use client';

import { cursorTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { isDrawingAtom, wallPointsAtom, previewPointAtom, wallsAtom } from '@/utils/atoms/drawing';

import { Wall } from '@/3D/components/Wall';

export const Board = () => {
  const [hovered, setHovered] = useState(false);

  const insert = useAtomValue(insertAtom);
  const setCursor = useSetAtom(cursorTypeAtom);

  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [points, setPoints] = useAtom(wallPointsAtom);
  const [walls, setWalls] = useAtom(wallsAtom);
  const [preview, setPreview] = useAtom(previewPointAtom);

  const SNAP_DISTANCE = 0.5; // tolerance for snapping to first point

  useEffect(() => {
    if (insert === 'wall' && hovered) {
      setCursor(CursorTypes.PENCIL);
    } else {
      setCursor(CursorTypes.DEFAULT);
    }
  }, [insert, hovered]);

  const handleBoardClick = (e: any) => {
    if (insert !== 'wall') return;

    const point = e.point.clone(); // 3D point on the board

    if (!isDrawing) {
      setPoints([point]);
      setIsDrawing(true);
    } else {
      const first = points[0];
      const last = points[points.length - 1];

      // Check if click is near first point -> close loop
      if (point.distanceTo(first) < SNAP_DISTANCE && points.length > 2) {
        setWalls([...walls, ...points.map((p, i) => [p, points[(i + 1) % points.length]])]);
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
    if (isDrawing) setPreview(e.point.clone());
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
