'use client';

import { Cameras } from '@/3D/Cameras';
import { Lights } from '@/3D/Lights';
import { Grid, OrbitControls, Wireframe } from '@react-three/drei';
import { MOUSE } from 'three';

export const Environment = () => {
  return (
    <>
      <Lights />
      <Cameras />
      <Grid
        renderOrder={-1}
        position={[0, 0.01, 0]}
        cellSize={1}
        sectionSize={1}
        sectionColor={'#D0D0CF'}
        sectionThickness={1}
        infiniteGrid={true}
      />

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
