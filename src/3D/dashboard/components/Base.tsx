import React, { useEffect } from 'react';

import { Cameras } from '@/3D/base/Cameras';
import { Controller } from '@/3D/base/Controller';
import { Lights } from '@/3D/base/Lights';
import { ResponsiveGrid } from '@/3D/base/ResponsiveGrid';

export const Base = () => {

  return (
    <>
      <Lights />
      <Cameras />
      <Controller enablePan={true} enableRotate={true} />
      <ResponsiveGrid />
    </>
  );
};
