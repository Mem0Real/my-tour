import { ThreeEvent } from '@react-three/fiber';
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

  onPointerDown?: (e: ThreeEvent<MouseEvent>) => void;
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
  onPointerDown?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerMove?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerUp?: (e: ThreeEvent<MouseEvent>) => void;
  onRightClick?: (e: ThreeEvent<MouseEvent>) => void;
  onKeyDown?: (e: KeyboardEvent) => void;

  // Edit
  handlePointerDown?: (e: ThreeEvent<MouseEvent>, wallData?: ActiveWallData) => void;
  handleRightClick?: (e: ThreeEvent<MouseEvent>, wallData?: ActiveWallData) => void;
  handlePointerOver?: (e: ThreeEvent<MouseEvent>, wallData?: ActiveWallData) => void;
  handlePointerOut?: () => void;
  handlePointerMove?: (e: ThreeEvent<MouseEvent>) => void;
  handlePointerUp?: () => void;
};
