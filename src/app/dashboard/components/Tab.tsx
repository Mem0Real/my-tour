'use client';

import React, { useEffect, useState } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { activeToolAtom } from '@/utils/atoms/ui';
import { keysPressedAtom } from '@/utils/atoms/ui';

// const tools = ['Add', 'Edit'];
const tools = [
  { label: 'Add', value: 'add' },
  { label: 'Edit', value: 'edit' },
];

export const Tab = () => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const keysPressed = useAtomValue(keysPressedAtom);

  // Keyboard shortcut to switch between tools (Alt + 1, 2 ...)
  useEffect(() => {
    if (!keysPressed) return;
    keysPressed <= 2 && setActiveTool(tools[keysPressed - 1].value);
  }, [keysPressed]);

  return (
    <div className='absolute -top-5 left-0 z-10 w-fit px-4 py-2 pt-4 rounded-b-2xl mt-2 ms-5 bg-neutral-200/40 dark:bg-neutral-200/80 shadow-inner shadow-neutral-500/80  text-neutral-900 transition-all duration-300 ease-in-out'>
      <div className='flex gap-4 items-center'>
        {tools.map((tool, i) => (
          <button
            key={i}
            className={`px-3 py-2 hover:cursor-pointer rounded-md ${
              tool.value === activeTool
                ? 'ring-2 ring-neutral-800/40 rounded-lg'
                : 'hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-300'
            }`}
            onClick={() => setActiveTool(tool.value)}
          >
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
};
