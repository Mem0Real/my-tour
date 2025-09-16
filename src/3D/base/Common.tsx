'use client';

import { Cameras } from '@/3D/base/Cameras';
import { Lights } from '@/3D/base/Lights';
import { Three } from '@/3D/base/Three';

export const Common = () => {
  return (
    <Three>
      <Lights />
      <Cameras />
    </Three>
  );
};
