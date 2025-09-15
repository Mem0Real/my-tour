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
  id: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  height?: number;
  dashed?: boolean;
  color?: string;

  // callbacks
  onHoverEndpoint?: (endPoint: EndpointRef | null) => void;
  onClickEndpoint?: (endPoint: EndpointRef) => void;

  hoveredEndpoint?: EndpointRef | null;
}

export interface EndpointRef {
  wallIndex: number;
  pointIndex: 0 | 1;
}
