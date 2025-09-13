'use client';

import { cameraTypeAtom } from '@/utils/atoms';
import { CameraTypes } from '@/utils/constants';
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useAtomValue } from 'jotai';

export const Cameras = () => {
  const cameraType = useAtomValue(cameraTypeAtom);
  const { size } = useThree();

  const aspect = size.width / size.height;
  const frustumSize = 50;

  return cameraType === CameraTypes.PERSPECTIVE ? (
    <PerspectiveCamera makeDefault fov={75} position={[0, 0, 5]} />
  ) : (
    <OrthographicCamera
      makeDefault
      position={[0, 50, 0]} // High above the scene
      zoom={5.2} // Adjust zoom for orthographic cameras
      left={(-frustumSize * aspect) / 2}
      right={(frustumSize * aspect) / 2}
      top={frustumSize / 2}
      bottom={-frustumSize / 2}
      near={0.1}
      far={100}
    />
  );
};
