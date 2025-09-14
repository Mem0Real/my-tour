import * as THREE from 'three';

interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  dashed?: boolean;
}

export const Wall = ({ start, end, dashed = false }: WallProps) => {
  const wallHeight = 2.5;
  const wallThickness = 0.1;

  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length()
  const mid = start.clone().add(dir.clone().multiplyScalar(0.5));
  const angle = Math.atan2(dir.z, dir.x);

  return (
    <mesh position={[mid.x, wallHeight / 2, mid.z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, wallHeight, wallThickness]} />
      <meshStandardMaterial color={dashed ? 'gray' : 'white'} metalness={0} roughness={1} />
    </mesh>
  );
};
