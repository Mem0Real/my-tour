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
  color?: string;
  hovered?: boolean;
  visible?: boolean;

  prevDir?: THREE.Vector3 | null;
  nextDir?: THREE.Vector3 | null;

  onPointerDown?: (e: any) => void;
}

export interface WallData {
  id: number;
  start: THREE.Vector3;
  end: THREE.Vector3;
}

export interface JointProps {
  walls: THREE.Vector3[][];
  thickness?: number;
  height?: number;

  onHoverEndpoint?: (endPoint: EndpointRef | null) => void;
  onClickEndpoint?: (endPoint: EndpointRef) => void;
  hoveredEndpoint?: EndpointRef | null;
}

export interface EndpointRef {
  wallIndex: number;
  pointIndex: 0 | 1;
  pos: THREE.Vector3 | null;
}

export type ToolHandlers = {
  // Add
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onRightClick?: (e: any) => void;
  onKeyDown?: (e: KeyboardEvent) => void;

  // Edit
  handlePointerDown?: (e: any, wallData?: WallData) => void;
  handleRightClick?: (e: any) => void;
  handlePointerOver?: (e: any, wallData?: WallData) => void;
  handlePointerOut?: () => void;
  handlePointerMove?: (e: any) => void;
  handlePointerUp?: () => void;
};
