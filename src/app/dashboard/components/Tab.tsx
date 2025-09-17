'use client';

import React, { useEffect } from 'react';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeToolAtom, cursorTypeAtom } from '@/utils/atoms/ui';
import { keysPressedAtom } from '@/utils/atoms/ui';

const tools = ['Add', 'Edit'];

export const Tab = () => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const keysPressed = useAtomValue(keysPressedAtom);

  // Keyboard shortcut to switch between tools (Alt + 1, 2 ...)
  useEffect(() => {
    if (!keysPressed) return;
    keysPressed <= 2 && setActiveTool(tools[keysPressed - 1]);
  }, [keysPressed]);

  return (
    <div className='absolute top-0 left-0 z-10 w-fit px-4 py-2 pt-4 rounded-b-2xl mt-5 ms-5 bg-neutral-200/40 shadow-inner shadow-neutral-500/80  text-neutral-900 transition-all duration-300 ease-in-out'>
      <div className='flex gap-4 items-center'>
        {tools.map((tool, i) => (
          <button
            key={i}
            className={`px-3 py-2 hover:cursor-pointer rounded-md ${
              tool === activeTool ? 'ring-2 ring-neutral-800/40 rounded-lg' : 'hover:bg-neutral-300'
            }`}
            onClick={() => setActiveTool(tool)}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};
