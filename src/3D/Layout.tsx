'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Children } from '@/utils/definitions';

const CanvasBase = dynamic(() => import('@/3D/base/CanvasBase').then((mod) => mod.CanvasBase), { ssr: false });

const Layout = ({ children, className = '' }: Children & { className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className={`relative w-full h-full overflow-hidden ${className}`}>
      {children}
      {/* <CanvasBase eventSource={ref} eventPrefix='client' /> */}
      <CanvasBase />
    </div>
  );
};

export { Layout };
