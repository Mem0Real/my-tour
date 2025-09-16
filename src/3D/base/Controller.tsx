import React from 'react';

import { OrbitControls, Wireframe } from '@react-three/drei';
import { MOUSE } from 'three';

import { useAtomValue } from 'jotai';
import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';

export const Controller = ({ enablePan = true, enableRotate = false }) => {
  const cameraType = useAtomValue(cameraTypeAtom);
  const orthographic = cameraType === CameraTypes.ORTHOGRAPHIC;

  let mouseButtons;

  if (orthographic) {
    mouseButtons = { RIGHT: MOUSE.PAN };
  } else {
    mouseButtons = { LEFT: MOUSE.PAN, RIGHT: MOUSE.ROTATE };
  }

  return (
    <OrbitControls
      enableRotate={enableRotate || !orthographic}
      enablePan={enablePan}
      dampingFactor={0.7}
      zoomSpeed={3}
      panSpeed={0.5}
      mouseButtons={mouseButtons}
      minZoom={1}
      maxZoom={20}
    />
  );
};
