import { CameraTypes, CursorTypes } from '@/utils/constants';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import * as THREE from 'three';

// General Atoms
export const cameraTypeAtom = atom<CameraTypes>(CameraTypes.ORTHOGRAPHIC);
export const cursorTypeAtom = atom<string>(CursorTypes.DEFAULT);
export const activeToolAtom = atom<string>('add');

// Keyboard Items
export const keyPressedAtom = atom<string | null>(null);

// Add UI
export const insertAtom = atom<string | null>(null);
export const toolsCollapsedAtom = atomWithStorage<boolean>('collapsed', true);

// Edit UI
export const menuVisibleAtom = atom<boolean>(false);
export const cursorPosAtom = atom<THREE.Vector3>();

// Options
export const wallHeightAtom = atom<number>(2.1);
export const wallThicknessAtom = atom<number>(0.1);
