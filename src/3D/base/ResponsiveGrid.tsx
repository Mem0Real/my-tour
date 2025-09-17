'use client';

import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { useEffect } from 'react';

export const ResponsiveGrid = () => {
  const { size, invalidate } = useThree();

  const sectionSize = 1.0; // 1 meter major grid

  // Invalidate on resize to update grid
  useEffect(() => {
    invalidate();
  }, [size, invalidate]);

  return (
    <Grid
      position={[0, -0.05, 0]}
      infiniteGrid
      cellSize={0}
      sectionSize={sectionSize}
      sectionThickness={1.0}
      sectionColor='#777'
      fadeDistance={120}
      fadeStrength={1}
      frustumCulled={false}
    />
  );
};
