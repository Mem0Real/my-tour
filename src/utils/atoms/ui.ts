import { CameraTypes, CursorTypes } from '@/utils/constants';
import { atom } from 'jotai';

export const cameraTypeAtom = atom<CameraTypes>(CameraTypes.ORTHOGRAPHIC);

export const cursorTypeAtom = atom<string>(CursorTypes.DEFAULT);

export const insertAtom = atom<string | null>(null);

export const keysPressedAtom = atom<number>(0);

export const toolsCollapsedAtom = atom<boolean>(false);

export const activeTabAtom = atom<string>('Add');
