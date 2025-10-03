'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { cameraTypeAtom, cursorTypeAtom, insertAtom, rulerAtom } from '@/utils/atoms/ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isDrawingAtom, previewPointAtom, snapCuesAtom } from '@/utils/atoms/drawing';
import { pointsAtom, roomsAtom } from '@/utils/atoms/drawing';

import { Children } from '@/utils/definitions';
import { snapToPoints, straighten } from '@/3D/helpers/wallHelper';
import { CameraTypes, CursorTypes, SNAP_DISTANCE, SNAP_TOLERANCE, STRAIGHT_THRESHOLD } from '@/utils/constants';

import Wall from '@/3D/dashboard/components/Wall';
import LengthOverlay from '@/3D/dashboard/components/LengthOverlay';

import { ToolInputProvider } from '@/3D/dashboard/components/ToolInputContext';
import { ThreeEvent } from '@react-three/fiber';

export const AddInterface = ({ children }: Children) => {
  const [points, setPoints] = useAtom(pointsAtom);
  const [rooms, setRooms] = useAtom(roomsAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [previewPoint, setPreviewPoint] = useAtom(previewPointAtom);

  const cameraType = useAtomValue(cameraTypeAtom);
  const ruler = useAtomValue(rulerAtom);

  const setSnapCues = useSetAtom(snapCuesAtom);
  const setInsert = useSetAtom(insertAtom);
  const setCursor = useSetAtom(cursorTypeAtom);

  const [currentLoop, setCurrentLoop] = useState<number[]>([]); // Indices into points
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (!isDrawing || !currentLoop.length) return;

          setCurrentLoop((prev) => prev.slice(0, -1));
          setPreviewPoint(null);

          if (currentLoop.length <= 1) setIsDrawing(false);
          break;

        case 'Shift':
          setShiftPressed(true);
          break;
      }
    },
    [isDrawing, currentLoop, setIsDrawing, setPreviewPoint]
  );

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Shift':
        setShiftPressed(false);
        break;
    }
  };

  useEffect(() => {
    setInsert('wall');
    setCursor(CursorTypes.CROSS);
  }, [setInsert, setCursor]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentLoop, isDrawing, handleKeyDown]);

  const handlePointerDown = (e: ThreeEvent<MouseEvent>) => {
    if (!e || !e.point || e.button === 2) return;
    if (cameraType !== CameraTypes.ORTHOGRAPHIC) return;

    const clicked = e.point.clone();
    clicked.y = 0;

    const currentPositions = currentLoop.map((idx) => points[idx]);

    const snapResult = snapToPoints(clicked, currentPositions, points, rooms, SNAP_TOLERANCE);

    const snappedPoint = snapResult.snappedPoint;

    if (!isDrawing) {
      const newIdx = snapResult.snappedPointIdx ?? points.length;
      if (snapResult.snappedPointIdx === undefined) {
        setPoints((prev) => [...prev, snappedPoint.clone()]);
      }

      if (
        snapResult.snappedRoomIdx !== undefined &&
        snapResult.snappedWallIdx !== undefined &&
        snapResult.snappedPointIdx === undefined
      ) {
        const newRooms = [...rooms];
        const targetRoom = [...newRooms[snapResult.snappedRoomIdx]];
        targetRoom.splice(snapResult.snappedWallIdx + 1, 0, newIdx);
        newRooms[snapResult.snappedRoomIdx] = targetRoom;
        setRooms(newRooms);
      }

      setCurrentLoop([newIdx]);
      setIsDrawing(true);
      setPreviewPoint(null);
      return;
    }

    // For subsequent points
    const firstIdx = currentLoop[0];
    const lastIdx = currentLoop[currentLoop.length - 1];
    const lastPoint = points[lastIdx];
    const newPos = straighten(lastPoint, snappedPoint, STRAIGHT_THRESHOLD);
    const firstPoint = points[firstIdx];

    const isNearFirst = currentLoop.length > 2 && newPos.distanceTo(firstPoint) < SNAP_DISTANCE;

    let newIdx: number;
    if (isNearFirst) {
      newIdx = firstIdx;
    } else if (snapResult.snappedPointIdx !== undefined) {
      newIdx = snapResult.snappedPointIdx;
    } else {
      newIdx = points.length;
      setPoints((prev) => [...prev, newPos.clone()]);
    }

    if (
      snapResult.snappedRoomIdx !== undefined &&
      snapResult.snappedWallIdx !== undefined &&
      snapResult.snappedPointIdx === undefined &&
      !isNearFirst
    ) {
      // Split only if not closing
      const newRooms = [...rooms];
      const targetRoom = [...newRooms[snapResult.snappedRoomIdx]];
      targetRoom.splice(snapResult.snappedWallIdx + 1, 0, newIdx);
      newRooms[snapResult.snappedRoomIdx] = targetRoom;
      setRooms(newRooms);
    }

    if (isNearFirst) {
      const roomToAdd = [...currentLoop, firstIdx];
      setRooms((prev) => [...prev, roomToAdd]);
      setCurrentLoop([]);
      setIsDrawing(false);
    } else if ((snapResult.snappedWall && snapResult.snappedPointIdx === undefined) || shiftPressed) {
      const roomToAdd = [...currentLoop, newIdx];
      setRooms((prev) => [...prev, roomToAdd]);
      setCurrentLoop([]);
      setIsDrawing(false);
    } else {
      setCurrentLoop([...currentLoop, newIdx]);
    }

    setPreviewPoint(null);
  };

  const handlePointerMove = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!e?.point || !isDrawing) return;
      if (cameraType !== CameraTypes.ORTHOGRAPHIC && !e.shiftKey) return;

      const cursor = e.point.clone();
      cursor.y = 0;

      const currentPositions = currentLoop.map((idx) => points[idx]);

      const snapResult = snapToPoints(cursor, currentPositions, points, rooms, SNAP_TOLERANCE);
      const snappedPoint = snapResult.snappedPoint;

      // Force preview to first point if close for closing visual cue
      if (currentLoop.length > 2) {
        const firstIdx = currentLoop[0];
        const firstPoint = points[firstIdx];
        if (snappedPoint.distanceTo(firstPoint) < SNAP_DISTANCE) {
          snappedPoint.copy(firstPoint);
          snapResult.snappedPointIdx = firstIdx;
          snapResult.snappedWall = undefined;
        }
      }

      const lastIdx = currentLoop[currentLoop.length - 1];
      const lastPoint = points[lastIdx];
      const straightened = straighten(lastPoint, snappedPoint, STRAIGHT_THRESHOLD);

      setPreviewPoint(straightened);
      setSnapCues([snappedPoint]);
    },
    [isDrawing, currentLoop, points, rooms, setPreviewPoint, setSnapCues, cameraType]
  );

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onKeyDown: handleKeyDown,
  };

  return (
    <ToolInputProvider value={handlers}>
      {children}
      {currentLoop.map((idx, i) => {
        if (i >= currentLoop.length - 1 && !previewPoint) return null;

        const start = points[idx];
        const end = currentLoop[i + 1] !== undefined ? points[currentLoop[i + 1]] : previewPoint;

        if (!end) return null;

        return (
          <React.Fragment key={`current-${i}`}>
            <Wall id={i} start={start} end={end} color='white' />
            {i === currentLoop.length - 1 && previewPoint && ruler && (
              <LengthOverlay start={start} end={previewPoint} visible />
            )}
          </React.Fragment>
        );
      })}
    </ToolInputProvider>
  );
};
