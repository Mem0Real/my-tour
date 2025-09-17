import React from 'react';

import { FirstPersonControls, OrbitControls, Wireframe } from '@react-three/drei';
import { MOUSE } from 'three';

import { useAtomValue } from 'jotai';
import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';

export const Controller = ({ enablePan = true, enableRotate = false }) => {
  const cameraType = useAtomValue(cameraTypeAtom);
  const { ORTHOGRAPHIC, FPS } = CameraTypes;

  let mouseButtons;

  if (cameraType === ORTHOGRAPHIC) {
    mouseButtons = { RIGHT: MOUSE.PAN };
  } else {
    mouseButtons = { LEFT: MOUSE.PAN, RIGHT: MOUSE.ROTATE };
  }

  return cameraType === FPS ? (
    <FirstPersonControls makeDefault />
  ) : (
    <OrbitControls
      enableRotate={enableRotate || !(cameraType === ORTHOGRAPHIC)}
      enablePan={enablePan}
      dampingFactor={0.7}
      zoomSpeed={3}
      panSpeed={0.5}
      mouseButtons={mouseButtons}
      minZoom={0.2}
      maxZoom={40}
    />
  );
};
