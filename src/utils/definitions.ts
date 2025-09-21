import * as THREE from 'three';

export interface Children {
  children: React.ReactNode;
}

export type Wall = [THREE.Vector3, THREE.Vector3];

export type Room = Wall[];

export interface LoopPoint {
  pos: THREE.Vector3;
  snappedWall?: [THREE.Vector3, THREE.Vector3] | null;
}

export interface SnapResult {
  snappedPoint: THREE.Vector3;
  snappedWall?: [THREE.Vector3, THREE.Vector3] | null;
}

export interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  height?: number;
  color?: string;
  prevDir?: THREE.Vector3 | null;
  nextDir?: THREE.Vector3 | null;
  roomIndex?: number; // added roomIndex for context if needed
  id?: number; // wall index if needed
  walls?: [THREE.Vector3, THREE.Vector3][]; // optional full walls array

  onPointerDown?: (e: any) => void;
}

export interface WallData {
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
  roomIndex: number;
  wallIndex: number;
  pointIndex: 0 | 1;
  pos: THREE.Vector3 | null;
}

export interface ActiveWallData extends WallData {
  roomIndex: number;
  wallIndex: number;
}

export interface WallIdentifier {
  index: number,
  pos: 0 | 1
}

export type ToolHandlers = {
  // Add
  onPointerDown?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onRightClick?: (e: any) => void;
  onKeyDown?: (e: KeyboardEvent) => void;

  // Edit
  handlePointerDown?: (e: any, wallData?: ActiveWallData) => void;
  handleRightClick?: (e: any) => void;
  handlePointerOver?: (e: any, wallData?: ActiveWallData) => void;
  handlePointerOut?: () => void;
  handlePointerMove?: (e: any) => void;
  handlePointerUp?: () => void;
};
