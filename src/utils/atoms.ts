import { CameraTypes, CursorTypes } from '@/utils/constants';
import { atom } from 'jotai';

export const cameraTypeAtom = atom<CameraTypes>(CameraTypes.ORTHOGRAPHIC);

export const cursorTypeAtom = atom<string>(CursorTypes.DEFAULT);
