import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  dashed?: boolean;
}

export const Wall = ({ start, end, dashed = false }: WallProps) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const mid = start.clone().add(dir.clone().multiplyScalar(0.5));
  const angle = Math.atan2(dir.z, dir.x);

  const thickness = 0.1;
  const height = 2.5;

  return (
    <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={dashed ? 'gray' : 'white'} />
    </mesh>
  );
};
