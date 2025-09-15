import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import React from 'react';

interface LengthOverlayProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  visible?: boolean;
}

export const LengthOverlay: React.FC<LengthOverlayProps> = ({ start, end, thickness = 0.1, visible = false }) => {
  const dir = new THREE.Vector3().subVectors(end, start).normalize();
  const halfThick = thickness / 2;

  // Trim so that the rules are placed on the wall edges
  const trimmedStart = start.clone().sub(dir.clone().multiplyScalar(halfThick));
  const trimmedEnd = end.clone().add(dir.clone().multiplyScalar(halfThick));

  const mid = new THREE.Vector3().addVectors(trimmedStart, trimmedEnd).multiplyScalar(0.5);

  // Perpendicular vector for small ticks at the edges
  const tickSize = 0.15;
  const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(tickSize * 2);

  const length = trimmedStart.distanceTo(trimmedEnd);

  return (
    <>
      {visible && (
        <>
          {/* Guideline 
          <Line points={[start, end]} color={'yellow'} lineWidth={1} /> */}

          {/* Start ticks */}
          <Line points={[start.clone().add(perp), start.clone().sub(perp)]} color={'#444'} lineWidth={2} />
          {/* End ticks */}
          <Line points={[end.clone().add(perp), end.clone().sub(perp)]} color={'#444'} lineWidth={2} />
        </>
      )}

      {/* Length text */}
      <Html
        position={[mid.x, 0.25, mid.z]} // slightly above the wall
        style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          fontSize: '12px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)', // center the text
        }}
      >
        {length.toFixed(2)} cm
      </Html>
    </>
  );
};
