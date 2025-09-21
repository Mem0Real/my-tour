import { CameraTypes, CursorTypes } from '@/utils/constants';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

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
