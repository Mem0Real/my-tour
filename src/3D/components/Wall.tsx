import * as THREE from 'three';

interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  dashed?: boolean;
  thickness?: number;
  height?: number;
}

export const Wall = ({ start, end, thickness = 0.1, height = 2.5, dashed = false }: WallProps) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length() + thickness;
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

  const angle = Math.atan2(dir.z, dir.x);

  return (
    <mesh position={[mid.x, height / 2, mid.z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color={dashed ? 'gray' : 'white'} metalness={0} roughness={1} />
    </mesh>
  );
};
