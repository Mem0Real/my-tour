// CanvasBase.tsx
'use client';

import { cursorTypeAtom } from '@/utils/atoms/ui';
import { Canvas } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { r3f } from '@/utils/globals';
import { Preload } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const CanvasBase = ({ props, eventSource, eventPrefix }: any) => {
  // Accept forwarded props
  const cursorType = useAtomValue(cursorTypeAtom);
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Canvas
      shadows
      className={`w-full h-full cursor-${cursorType || 'auto'} antialiased`}
      style={{ position: 'absolute', top: 0, left: 0 }}
      {...props}
    >
      <color attach='background' args={[theme === 'dark' ? '#212122' : '#ededed']} />
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
};
