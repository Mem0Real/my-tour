import { useEffect } from 'react';
import { activeToolAtom, cameraTypeAtom, keyPressedAtom, rulerAtom, toolsCollapsedAtom } from '@/utils/atoms/ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { CameraTypes } from '@/utils/constants';
import { useTheme } from 'next-themes';

export const KeyboardListener = () => {
  const { setTheme } = useTheme();

  const keyPressed = useAtomValue(keyPressedAtom);

  const setActiveTool = useSetAtom(activeToolAtom);
  const setCameraType = useSetAtom(cameraTypeAtom);
  const setIsCollapsed = useSetAtom(toolsCollapsedAtom);
  const setRuler = useSetAtom(rulerAtom);

  const { ORTHOGRAPHIC, PERSPECTIVE } = CameraTypes;

  useEffect(() => {
    if (!keyPressed) return;

    switch (keyPressed) {
      case 'a':
        console.log('called');
        setActiveTool('add');
        break;

      case 'e':
        console.log('called');
        setActiveTool('edit');
        break;

      case 'f':
        setCameraType((prev) => (prev === PERSPECTIVE ? ORTHOGRAPHIC : PERSPECTIVE));
        break;

      case 'q':
        setIsCollapsed((prev) => !prev);
        break;

      case 'd':
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
        break;

      case 'r':
        setRuler(prev => !prev);
        break;
    }
  }, [keyPressed, setActiveTool, setCameraType, setIsCollapsed, ORTHOGRAPHIC, PERSPECTIVE]);

  return null;
};
