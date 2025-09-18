'use client';

import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ResponsiveGrid = () => {
  const { size, invalidate } = useThree();
  const { theme } = useTheme();

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
      sectionColor={theme === 'dark' ? '#ededed' : '#a5a5aa'}
      fadeDistance={120}
      fadeStrength={1}
      frustumCulled={false}
    />
  );
};
