import * as THREE from 'three';
import { Wall } from './Wall';
import { LengthOverlay } from './LengthOverlay';
import { useState } from 'react';

interface WallChainProps {
  points: THREE.Vector3[];
  thickness: number;
  height: number;
  color: string;
  closed?: boolean;
  overlay?: boolean | 'active'; // <-- add this
}

export function WallChain({ points, thickness, height, color, closed = false, overlay = false }: WallChainProps) {
  if (points.length < 2) return null;
  const [hoveredWallIndex, setHoveredWallIndex] = useState<number | null>(null);
  const segmentCount = closed ? points.length : points.length - 1;

  return (
    <>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const start = points[i];
        // const end = closed ? points[(i + 1) % points.length] : points[i + 1];
        const end = points[i + 1];

        if (!end) return null; // safeguard

        const hasPrev = closed || i > 0;
        const hasNext = closed || i + 2 < points.length;

        const prev = hasPrev ? points[(i - 1 + points.length) % points.length] : null;
        const next = hasNext ? points[(i + 2) % points.length] : null;

        const prevDir = prev ? new THREE.Vector3().subVectors(start, prev).normalize() : null;
        const nextDir = next ? new THREE.Vector3().subVectors(next, end).normalize() : null;

        const showOverlay = overlay === true || (overlay === 'active' && i === segmentCount - 1);

        return (
          <group key={i} onPointerOver={() => setHoveredWallIndex(i)} onPointerOut={() => setHoveredWallIndex(-1)}>
            <Wall
              id={i}
              start={start}
              end={end}
              thickness={thickness}
              height={height}
              color={color}
              // prevDir={prevDir}
              // nextDir={nextDir}
            />
            {i === hoveredWallIndex && showOverlay && <LengthOverlay start={start} end={end} />}
          </group>
        );
      })}
    </>
  );
}
