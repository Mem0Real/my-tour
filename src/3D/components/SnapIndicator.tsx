import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { getSnapGuide } from '@/3D/helpers/snapHelper';

interface SnapIndicatorProps {
  points: THREE.Vector3[];
  currentPos: THREE.Vector3;
}

export const SnapIndicator = ({ points, currentPos }: SnapIndicatorProps) => {
  const { snapPoint, snapType } = getSnapGuide(points, currentPos);

  if (!snapPoint || !snapType) return null;

  if (snapType === 'x') {
    return (
      <Line
        points={[new THREE.Vector3(snapPoint.x, 0, -100), new THREE.Vector3(snapPoint.x, 0, 100)]}
        color='yellow'
        lineWidth={2}
      />
    );
  }

  if (snapType === 'z') {
    return (
      <Line
        points={[new THREE.Vector3(-100, 0, snapPoint.z), new THREE.Vector3(100, 0, snapPoint.z)]}
        color='yellow'
        lineWidth={2}
      />
    );
  }

  if (snapType === 'edge') {
    return (
      <Line
        points={[
          new THREE.Vector3(snapPoint.x - 1, 0, snapPoint.z),
          new THREE.Vector3(snapPoint.x + 1, 0, snapPoint.z),
        ]}
        color='yellow'
        lineWidth={2}
      />
    );
  }

  return null;
};
