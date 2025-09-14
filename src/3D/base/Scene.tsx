'use client';

import { Common } from '@/3D/base/Common';
import { Three } from '@/3D/base/Three';

export const Scene = () => {
  return (
    <Three>
      <Common />
      <mesh>
        <sphereGeometry />
        <meshBasicMaterial />
      </mesh>
    </Three>
  );
};
