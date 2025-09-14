import React, { FC, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface Props {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

export const LengthOverlay: FC<Props> = ({ start, end }) => {
  const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
  const length = start.distanceTo(end);

  return (
    length > 1 && (
      <Html
        position={[mid.x, 0.05, mid.z]}
        center
        style={{
          fontSize: '12px',
          color: 'yellow',
          background: 'rgba(0,0,0,0.5)',
          padding: '2px 4px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {length.toFixed(2)} m
      </Html>
    )
  );
};
