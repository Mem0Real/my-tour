import * as THREE from 'three';

export interface Children {
  children: React.ReactNode;
}

export type Point = THREE.Vector3;

export type Wall = [THREE.Vector3, THREE.Vector3];

export type Room = number[]; // Array of point indices into pointsAtom

export interface LoopPoint {
  idx: number; // Index into points
  snappedWall?: Wall | null;
}

export interface SnapResult {
  snappedPoint: THREE.Vector3;
  snappedWall?: Wall;
  snappedPointIdx?: number;
  snappedRoomIdx?: number;
  snappedWallIdx?: number;
}

export interface WallProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  thickness?: number;
  height?: number;
  color?: string;
  prevDir?: THREE.Vector3 | null;
  nextDir?: THREE.Vector3 | null;
  roomIndex?: number;
  id?: number;
  rooms?: Room[];

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
  isStart: boolean;
  pos: THREE.Vector3 | null;
}

export interface ActiveWallData {
  roomIndex: number;
  wallIndex: number; // Segment index in the room's point list
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
