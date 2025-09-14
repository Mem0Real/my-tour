import { atom } from 'jotai';
import * as THREE from 'three';

export const isDrawingAtom = atom(false);
export const wallPointsAtom = atom<THREE.Vector3[]>([]); // points of the chain
export const previewPointAtom = atom<THREE.Vector3 | null>(null);
export const wallsAtom = atom<THREE.Vector3[][]>([]); // array of [start, end]
