'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { useTheme } from 'next-themes';

import { r3f } from '@/utils/globals';
import { cursorTypeAtom } from '@/utils/atoms/ui';
// import { Children } from '@/utils/definitions';

export const CanvasBase = () => {
  const cursorType = useAtomValue(cursorTypeAtom);
  const { theme } = useTheme();

  // To make sure the component is mounted before loading canvas (gets rid of hydration err)
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
    >
      <color attach='background' args={[theme === 'dark' ? '#212122' : '#ededed']} />
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
};
