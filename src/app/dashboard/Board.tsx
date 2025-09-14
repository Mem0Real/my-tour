'use client';

import { cursorTypeAtom, insertAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { drawingWallAtom, wallStartAtom, previewEndAtom, wallsAtom } from '@/utils/atoms/drawing';
import * as THREE from 'three';
import { Wall } from '@/3D/components/Wall';

export const Board = () => {
  const [hovered, setHovered] = useState(false);

  const insert = useAtomValue(insertAtom);
  const setCursor = useSetAtom(cursorTypeAtom);

  const [drawing, setDrawing] = useAtom(drawingWallAtom);
  const [start, setStart] = useAtom(wallStartAtom);
  const [previewEnd, setPreviewEnd] = useAtom(previewEndAtom);
  const [walls, setWalls] = useAtom(wallsAtom);

  useEffect(() => {
    if (insert === 'wall' && hovered) {
      setCursor(CursorTypes.PENCIL);
    } else {
      setCursor(CursorTypes.DEFAULT);
    }
  }, [insert, hovered]);

  const handleBoardClick = (e: any) => {
    const point = e.point.clone(); // 3D point on the board

    if (!drawing) {
      setStart(point);
      setDrawing(true);
    } else {
      setWalls([...walls, [start!, point]]);
      setStart(null);
      setPreviewEnd(null);
      setDrawing(false);
    }
  };

  const handleBoardMove = (e: any) => {
    if (drawing && start) {
      setPreviewEnd(e.point.clone());
    }
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

      {walls.map(([a, b], i) => (
        <Wall key={i} start={a} end={b} />
      ))}

      {start && previewEnd && <Wall start={start} end={previewEnd} dashed />}
    </>
  );
};
