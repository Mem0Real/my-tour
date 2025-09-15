import React from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

import { useAtomValue } from 'jotai';
import { isDrawingAtom } from '@/utils/atoms/drawing';

type SnapCuesProps = {
  points: THREE.Vector3[];
};

export const SnapCues: React.FC<SnapCuesProps> = ({ points }) => {
  const isDrawing = useAtomValue(isDrawingAtom);

  if (!points.length || !isDrawing) return null;

  return (
    <>
      {points.map((p, i) => (
        <React.Fragment key={i}>
          {/* X axis guideline */}
          <Line
            points={[
              new THREE.Vector3(-1000, 0.01, p.z), // offset Y slightly so it renders above the floor
              new THREE.Vector3(1000, 0.01, p.z),
            ]}
            color='orange'
            lineWidth={1}
          />
          {/* Z axis guideline */}
          <Line
            points={[new THREE.Vector3(p.x, 0.01, -1000), new THREE.Vector3(p.x, 0.01, 1000)]}
            color='orange'
            lineWidth={1}
          />
        </React.Fragment>
      ))}
    </>
  );
};
