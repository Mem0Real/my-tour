// LengthOverlay.tsx
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import React from 'react';

interface LengthOverlayProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  visible?: boolean;
}

export const LengthOverlay: React.FC<LengthOverlayProps> = ({ start, end, thickness = 0.1, visible = true }) => {
  if (!visible) return null;

  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const length = start.distanceTo(end) - thickness; // subtract thickness so ticks sit right at the edge

  // Trimmed edges (accounting for thickness/2 at both ends)
  const halfThick = thickness / 2;
  const trimmedStart = start.clone().sub(dir.clone().multiplyScalar(halfThick));
  const trimmedEnd = end.clone().add(dir.clone().multiplyScalar(halfThick));

  const mid = new THREE.Vector3().addVectors(trimmedStart, trimmedEnd).multiplyScalar(0.5);

  // Perpendicular vector for ticks
  const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(0.15); // tick size

  return (
    <>
      {/* Guideline */}
      <Line points={[trimmedStart, trimmedEnd]} color='yellow' lineWidth={1} />

      {/* Start tick */}
      <Line points={[trimmedStart.clone().add(perp), trimmedStart.clone().sub(perp)]} color='yellow' lineWidth={2} />

      {/* End tick */}
      <Line points={[trimmedEnd.clone().add(perp), trimmedEnd.clone().sub(perp)]} color='yellow' lineWidth={2} />

      {/* Length label */}
      {/* <Html
        position={[mid.x, 0.05, mid.z]}
        center
        rotation-y={-Math.atan2(dir.z, dir.x)} // rotate to follow wall
      >
        <div
          style={{
            background: 'black',
            color: 'yellow',
            fontSize: '12px',
            padding: '2px 4px',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            transform: 'translateY(-10px)', // lift above wall a bit
          }}
        >
          {length.toFixed(2)} m
        </div>
      </Html> */}
    </>
  );
};
