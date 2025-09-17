import { atom } from 'jotai';
import * as THREE from 'three';

export const wallsAtom = atom<THREE.Vector3[][]>([]); // array of [start, end]
export const loopsAtom = atom<THREE.Vector3[][]>([]);
export const isDrawingAtom = atom(false);
export const wallPointsAtom = atom<THREE.Vector3[]>([]); // points of the chain
export const previewPointAtom = atom<THREE.Vector3 | null>(null);
export const snapCuesAtom = atom<THREE.Vector3[]>([]);
export const activeWallAtom = atom<{ id: number; start: THREE.Vector3; end: THREE.Vector3 } | null>(null);
