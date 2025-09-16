import { atom } from 'jotai';

type SceneHandler = ((e: any) => void) | null;

export const onPointerDownAtom = atom<SceneHandler>(null);
export const onPointerMoveAtom = atom<SceneHandler>(null);
export const onPointerUpAtom = atom<SceneHandler>(null);
export const onRightClick = atom<SceneHandler>(null);
export const onKeyDownAtom = atom<SceneHandler>(null);
