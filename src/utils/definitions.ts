import * as THREE from 'three';

export interface Children {
  children: React.ReactNode;
}

export interface LoopPoint {
  pos: THREE.Vector3;
  snappedWall?: [THREE.Vector3, THREE.Vector3] | null;
}

export interface SnapResult {
  snappedPoint: THREE.Vector3;
  snappedWall?: [THREE.Vector3, THREE.Vector3] | null;
}

export interface WallProps {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  height?: number;
  dashed?: boolean;
  color?: string;

  onHoverEndpoint?: (pointIndex: 0 | 1 | null) => void;
  onClickEndpoint?: (pointIndex: 0 | 1) => void;
  hoveredEndpoint?: 0 | 1 | null;
}
