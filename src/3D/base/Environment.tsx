'use client';

import { Cameras } from '@/3D/base/Cameras';
import { Lights } from '@/3D/base/Lights';
import { OrbitControls, Wireframe } from '@react-three/drei';
import { MOUSE } from 'three';

export const Environment = () => {
  return (
    <>
      <Lights />
      <Cameras />

      <OrbitControls
        enableRotate={false}
        dampingFactor={0.3}
        zoomSpeed={3}
        mouseButtons={{ LEFT: MOUSE.PAN, RIGHT: MOUSE.PAN }}
        minZoom={2}
        maxZoom={75}
      />
    </>
  );
};
