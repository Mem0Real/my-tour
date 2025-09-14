import { atom } from 'jotai';
import * as THREE from 'three';

export const drawingWallAtom = atom(false);
export const wallStartAtom = atom<THREE.Vector3 | null>(null);
export const previewEndAtom = atom<THREE.Vector3 | null>(null);
export const wallsAtom = atom<THREE.Vector3[][]>([]); // array of [start, end]
