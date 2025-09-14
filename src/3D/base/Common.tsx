'use client';

import { Cameras } from '@/3D/base/Cameras';
import { Lights } from '@/3D/base/Lights';
import { OrbitControls, Wireframe } from '@react-three/drei';
import { MOUSE } from 'three';
import { Three } from '@/3D/base/Three';

export const Common = () => {
  return (
    <Three>
      <Lights />
      <Cameras />

      <OrbitControls
        enableRotate={false}
        dampingFactor={0.7}
        zoomSpeed={3}
        panSpeed={0.5}
        mouseButtons={{ LEFT: MOUSE.PAN, RIGHT: MOUSE.PAN }}
        minZoom={2}
        maxZoom={75}
      />
    </Three>
  );
};
