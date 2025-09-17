import * as THREE from 'three';
import { Wall } from './Wall';

interface WallChainProps {
  points: THREE.Vector3[];
  thickness: number;
  height: number;
  color: string;
  closed?: boolean;
}

export function WallChain({ points, thickness, height, color, closed = false }: WallChainProps) {
  if (points.length < 2) return null;
  const segmentCount = closed ? points.length : points.length - 1;

  return (
    <>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const start = points[i];
        const end = points[(i + 1) % points.length];

        // Only assign prev/next if they truly exist (for open chains)
        const hasPrev = closed || i > 0;
        const hasNext = closed || i + 2 < points.length;

        const prev = hasPrev ? points[(i - 1 + points.length) % points.length] : null;
        const next = hasNext ? points[(i + 2) % points.length] : null;

        const prevDir = prev ? new THREE.Vector3().subVectors(start, prev).normalize() : null;
        const nextDir = next ? new THREE.Vector3().subVectors(next, end).normalize() : null;

        return (
          <Wall
            key={i}
            id={i}
            start={start}
            end={end}
            thickness={thickness}
            height={height}
            color={color}
            prevDir={prevDir}
            nextDir={nextDir}
            // rest of props...
          />
        );
      })}
    </>
  );
}
