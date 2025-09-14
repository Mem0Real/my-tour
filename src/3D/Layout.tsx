'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Children } from '@/utils/definitions'

const CanvasBase = dynamic(() => import('@/3D/base/CanvasBase').then(mod => mod.CanvasBase), { ssr: false })

const Layout = ({ children }: Children) => {
  const ref = useRef(null)

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
      
      <CanvasBase
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        eventSource={ref}
        eventPrefix='client'
      />
    </div>
  )
}

export { Layout }