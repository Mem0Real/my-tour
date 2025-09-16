'use client';

import { CanvasBase } from '@/3D/base/CanvasBase';
import { Scene } from '@/3D/base/Scene';
import { Three } from '@/3D/base/Three';
import { Canvas } from '@react-three/fiber';
import tunnel from 'tunnel-rat';

import { r3f } from '@/utils/globals';

export default function Home() {
  const three = tunnel();

  return (
    <div className='viewer-container'>
      <CanvasBase />

      {/* <Three>
        <mesh>
          <sphereGeometry />
          <meshBasicMaterial />
        </mesh>
      </Three> */}

      {/* <Canvas>
        <r3f.Out />
      </Canvas> */}
    </div>
  );
}
