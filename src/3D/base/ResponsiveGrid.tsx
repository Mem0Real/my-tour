'use client';

import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { useEffect } from 'react';

export const ResponsiveGrid = () => {
  const { size, invalidate } = useThree();

  // Dynamic divisions based on viewport size for consistent density
  const sectionSize = 1.0; // 1 meter major grid
  const divisions = Math.floor(Math.min(size.width, size.height) / 50); // Adjust density

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
      sectionColor='rgba(150, 150, 150, 0.7)'
      fadeDistance={40}
      fadeStrength={1}
      frustumCulled={false}
    />
  );
};
