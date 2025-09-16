'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Children } from '@/utils/definitions';

const CanvasBase = dynamic(() => import('@/3D/base/CanvasBase').then((mod) => mod.CanvasBase), { ssr: false });

const Layout = ({ children }: Children) => {
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: ' 100%',
        height: '100%',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      {children}

      <CanvasBase eventSource={ref} eventPrefix='client' />
    </div>
  );
};

export { Layout };
