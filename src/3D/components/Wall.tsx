import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  dashed?: boolean;
}

export const Wall = ({ start, end, dashed = false }: WallProps) => {
  return <Line points={[start, end]} color={dashed ? 'gray' : 'black'} lineWidth={2} dashed={dashed} />;
};
