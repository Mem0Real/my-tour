import React, { useEffect } from 'react';

import { Cameras } from '@/3D/base/Cameras';
import { Controller } from '@/3D/base/Controller';
import { Lights } from '@/3D/base/Lights';
import { ResponsiveGrid } from '@/3D/base/ResponsiveGrid';
import { useAtomValue } from 'jotai';
import { activeWallAtom } from '@/utils/atoms/drawing';

export const Base = () => {
  const activeWall = useAtomValue(activeWallAtom);
  return (
    <>
      <Lights />
      <Cameras />
      <Controller enablePan={!activeWall} enableRotate={true} />
      <ResponsiveGrid />
    </>
  );
};
