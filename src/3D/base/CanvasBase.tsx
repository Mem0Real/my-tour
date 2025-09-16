// CanvasBase.tsx
'use client';

import { cursorTypeAtom } from '@/utils/atoms/ui';
import { Canvas } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { r3f } from '@/utils/globals';
import { Preload } from '@react-three/drei';

export const CanvasBase = ({ props, eventSource, eventPrefix }: any) => {
  // Accept forwarded props
  const cursorType = useAtomValue(cursorTypeAtom);

  return (
    <Canvas
      shadows
      gl={{ antialias: false }}
      className={`w-full h-full cursor-${cursorType || 'auto'}`} // Explicit w-full h-full
      style={{ position: 'absolute', top: 0, left: 0 }} // Absolute to fill parent exactly
      {...props} // Forward any other props (e.g., eventSource, eventPrefix)
    >
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
};
