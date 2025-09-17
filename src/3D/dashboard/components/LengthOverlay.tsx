import * as THREE from 'three';
import { Line, Html, Text } from '@react-three/drei';
import React from 'react';

interface LengthOverlayProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  visible?: boolean;
}

export const LengthOverlay: React.FC<LengthOverlayProps> = React.memo(
  ({ start, end, thickness = 0.1, visible = false }) => {
    if (end.distanceTo(start) < 0.005) return null;

    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const length = start.distanceTo(end) * 100; // Convert to cm, using raw distance

    // Perpendicular vector for guidelines and offsets
    const offsetSize = 0.3;
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(offsetSize);

    // Determine if wall is horizontal or vertical
    const isHorizontal = Math.abs(dir.x) > Math.abs(dir.z);

    // Guideline points (use raw start/end, extend with perp)
    const guidelineOuterStart = start.clone().add(perp);
    const guidelineOuterEnd = end.clone().add(perp);
    const guidelineInnerStart = start.clone().sub(perp);
    const guidelineInnerEnd = end.clone().sub(perp);

    // Hook size and direction (perpendicular to wall)
    const hookSize = 0.25;
    const hookDir = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

    // Hooks at start and end for outer guideline
    const outerStartHook1 = guidelineOuterStart.clone().add(hookDir.clone().multiplyScalar(hookSize / 8));
    const outerStartHook2 = guidelineOuterStart.clone().sub(hookDir.clone().multiplyScalar(hookSize));
    const outerEndHook1 = guidelineOuterEnd.clone().add(hookDir.clone().multiplyScalar(hookSize / 8));
    const outerEndHook2 = guidelineOuterEnd.clone().sub(hookDir.clone().multiplyScalar(hookSize));

    // Hooks at start and end for inner guideline
    const innerStartHook1 = guidelineInnerStart.clone().add(hookDir.clone().multiplyScalar(hookSize));
    const innerStartHook2 = guidelineInnerStart.clone().sub(hookDir.clone().multiplyScalar(hookSize / 8));
    const innerEndHook1 = guidelineInnerEnd.clone().add(hookDir.clone().multiplyScalar(hookSize));
    const innerEndHook2 = guidelineInnerEnd.clone().sub(hookDir.clone().multiplyScalar(hookSize / 8));

    // Text positions (offset like lines)
    const outerMid = new THREE.Vector3().addVectors(guidelineOuterStart, guidelineOuterEnd).multiplyScalar(0.5);
    const innerMid = new THREE.Vector3().addVectors(guidelineInnerStart, guidelineInnerEnd).multiplyScalar(0.5);

    // Text rotation (no flipping, content-aware)
    const textRotation = isHorizontal ? '0deg' : '-90deg'; // Horizontal: 0deg, Vertical: -90deg (bottom to top)

    return (
      <>
        <>
          {/* Outer guideline */}
          <Line points={[guidelineOuterStart, guidelineOuterEnd]} color={'#777'} lineWidth={2} />
          {/* Outer hooks */}
          <Line points={[outerStartHook1, outerStartHook2]} color={'#777'} lineWidth={2} />
          <Line points={[outerEndHook1, outerEndHook2]} color={'#777'} lineWidth={2} />

          {/* Inner guideline */}
          {visible && (
            <>
              <Line points={[guidelineInnerStart, guidelineInnerEnd]} color={'#777'} lineWidth={2} />
              {/* // Inner hooks */}
              <Line points={[innerStartHook1, innerStartHook2]} color={'#777'} lineWidth={2} />
              <Line points={[innerEndHook1, innerEndHook2]} color={'#777'} lineWidth={2} />
            </>
          )}
        </>

        {/* Outer text */}
        <Html
          position={outerMid}
          style={{
            background: 'white',
            color: '#1a1a1a',
            padding: '2px 2px',
            fontSize: '13px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
            transform: `translate(-50%, -50%) rotate(${textRotation})`,
            transformOrigin: 'center',
          }}
        >
          {length.toFixed(2)} cm
        </Html>

        {/* Inner text */}
        {visible && (
          <Html
            position={innerMid}
            style={{
              background: 'white',
              color: '#1a1a1a',
              padding: '2px 2px',
              fontSize: '13px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              pointerEvents: 'none',
              transform: `translate(-50%, -50%) rotate(${textRotation})`,
              transformOrigin: 'center',
            }}
          >
            {length.toFixed(2)} cm
          </Html>
        )}

        {/* <Text
            position={innerMid}
            fontSize={0.15}
            color='#1a1a1a'
            anchorX='center'
            anchorY='middle'
            outlineColor='white'
            outlineWidth={0.01}
          >
            {length.toFixed(2)} cm
          </Text> */}
      </>
    );
  }
);
