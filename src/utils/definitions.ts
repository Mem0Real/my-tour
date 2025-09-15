import * as THREE from 'three';

export interface Children {
  children: React.ReactNode;
}

export interface LoopPoint {
  pos: THREE.Vector3;
  snappedWall?: [THREE.Vector3, THREE.Vector3];
}

export interface SnapResult {
  snappedPoint: THREE.Vector3;
  snappedWall?: [THREE.Vector3, THREE.Vector3]
}