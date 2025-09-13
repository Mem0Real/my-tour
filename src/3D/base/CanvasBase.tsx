'use client';

import { cursorTypeAtom } from '@/utils/atoms';
import { Children } from '@/utils/definitions';
import { Canvas } from '@react-three/fiber';
import { useAtomValue } from 'jotai';

export const CanvasBase = ({ children }: Children) => {
  const cursorType = useAtomValue(cursorTypeAtom);

  return (
    <Canvas shadows gl={{ antialias: false }} className={`cursor-${cursorType || 'auto'}`}>
      {children}
    </Canvas>
  );
};
