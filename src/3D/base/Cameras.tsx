import { useThree } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { cameraTypeAtom } from '@/utils/atoms/ui';
import { CameraTypes } from '@/utils/constants';

export const Cameras = () => {
  const { size, camera } = useThree();
  const aspect = size.width / size.height;

  const cameraType = useAtomValue(cameraTypeAtom);

  // For orthographic camera, make it responsive so that 1m sections appear approximately 60 pixels on screen
  const thumbnailPixels = 60; // Approximate pixel size for thumbnail (based on average ~1.5cm at ~100 PPI)
  const sectionSize = 1.0;
  const basePixelPerUnit = thumbnailPixels / sectionSize;
  const baseVisibleHeight = size.height / basePixelPerUnit;
  const left = -baseVisibleHeight * aspect / 2;
  const right = baseVisibleHeight * aspect / 2;
  const top = baseVisibleHeight / 2;
  const bottom = -baseVisibleHeight / 2;

  useEffect(() => {
    if (cameraType === CameraTypes.PERSPECTIVE) {
      camera.position.set(5, 1.6, 5);
      camera.lookAt(0, 1.6, 0);
    } else {
      camera.position.set(0, 10, 0);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, cameraType]);

  return cameraType === CameraTypes.PERSPECTIVE ? (
    <PerspectiveCamera makeDefault fov={60} near={0.1} far={50} />
  ) : (
    <OrthographicCamera
      makeDefault
      left={left}
      right={right}
      top={top}
      bottom={bottom}
      near={0.1}
      far={100}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
};