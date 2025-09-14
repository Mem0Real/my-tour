import * as THREE from 'three';
import React, { FC, useMemo } from 'react';

interface Props {
  start: THREE.Vector3;
  end: THREE.Vector3;
  active?: boolean;
}

export const SnapIndicator: FC<Props> = ({ start, end, active = true }) => {
  if (!active) return null;

  // Float32Array for two 3D points
  const pointsArray = useMemo(
    () =>
      new Float32Array([
        start.x, start.y + 0.02, start.z,
        end.x, end.y + 0.02, end.z,
      ]),
    [start, end]
  );

  return (
    <line>
      <bufferGeometry>
        {/* Use args to construct BufferAttribute to satisfy R3F/TS types */}
        <bufferAttribute attach="attributes-position" args={[pointsArray, 3]} />
      </bufferGeometry>
      <lineBasicMaterial linewidth={2} color={'yellow'} depthTest={false} />
    </line>
  );
};