'use client';

import { cursorTypeAtom } from '@/utils/atoms';
import { Children } from '@/utils/definitions';
import { Canvas } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { r3f } from '@/utils/globals';
import { Preload } from '@react-three/drei';

export const CanvasBase = ({ props }: any) => {
  const cursorType = useAtomValue(cursorTypeAtom);

  return (
    <Canvas shadows gl={{ antialias: false }} className={`cursor-${cursorType || 'auto'}`} {...props}>
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
};
