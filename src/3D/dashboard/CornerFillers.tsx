// CornerFillers.tsx
'use client';

import * as THREE from 'three';
import React, { useMemo } from 'react';

type Props = {
  points: THREE.Vector3[]; // closed or open polyline; fillers need neighbors
  thickness: number;
  height: number;
  color?: string;
  onlyAtClosedLoops?: boolean; // optional
};

export function CornerFillers({ points, thickness, height, color = 'white', onlyAtClosedLoops }: Props) {
  const items = useMemo(() => {
    const out: {
      shape: THREE.Shape;
      position: THREE.Vector3;
      rotation: THREE.Euler;
      key: string;
    }[] = [];

    if (points.length < 2) return out;

    const n = points.length;
    const isClosed = points[0].distanceTo(points[n - 1]) < 1e-6;
    const count = onlyAtClosedLoops ? (isClosed ? n : 0) : n;

    for (let i = 0; i < count; i++) {
      const prev = points[(i - 1 + n) % n];
      const curr = points[i];
      const next = points[(i + 1) % n];

      // If open polyline and at ends, skip because no corner to fill
      if (!isClosed && (i === 0 || i === n - 1)) continue;

      const p = new THREE.Vector2(curr.x, curr.z);
      const a = new THREE.Vector2(prev.x, prev.z);
      const b = new THREE.Vector2(next.x, next.z);

      const dir1 = new THREE.Vector2().subVectors(p, a).normalize();
      const dir2 = new THREE.Vector2().subVectors(b, p).normalize();

      if (dir1.lengthSq() < 1e-8 || dir2.lengthSq() < 1e-8) continue;

      const n1 = new THREE.Vector2(-dir1.y, dir1.x).multiplyScalar(thickness / 2);
      const n2 = new THREE.Vector2(-dir2.y, dir2.x).multiplyScalar(thickness / 2);

      // Triangle in XZ plane around the corner
      const p1 = new THREE.Vector2(p.x + n1.x, p.y + n1.y);
      const p2 = new THREE.Vector2(p.x + n2.x, p.y + n2.y);

      // If the angle is nearly straight, skip to avoid skinny triangles
      const dot = dir1.dot(dir2);
      if (dot > 0.999) continue;

      const shape = new THREE.Shape();
      shape.moveTo(p.x, p.y);
      shape.lineTo(p1.x, p1.y);
      shape.lineTo(p2.x, p2.y);
      shape.closePath();

      out.push({
        shape,
        position: new THREE.Vector3(0, 0, 0), // we’ll place via geometry vertices
        rotation: new THREE.Euler(-Math.PI / 2, 0, 0), // XY -> XZ (so extrude along +Y)
        key: `corner-${i}`,
      });
    }

    return out;
  }, [points, thickness]);

  if (!items.length) return null;

  return (
    <>
      {items.map(({ shape, rotation, key }) => {
        // Extrude upward by height; after rotation, this becomes along +Y
        const geom = new THREE.ExtrudeGeometry(shape, {
          steps: 1,
          depth: height,
          bevelEnabled: false,
        });
        // Important: after rotation, base sits on y=0 and top at y=height
        geom.rotateX(-Math.PI / 2); // rotate shape plane from XY to XZ
        // No translation needed; XY’s z-depth becomes Y after rotation

        return (
          <mesh key={key} geometry={geom} castShadow receiveShadow>
            <meshStandardMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </>
  );
}
