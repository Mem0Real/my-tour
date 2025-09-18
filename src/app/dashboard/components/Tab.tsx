'use client';

import React, { useEffect, useState } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { activeToolAtom } from '@/utils/atoms/ui';
import { numberPressedAtom } from '@/utils/atoms/ui';

// const tools = ['Add', 'Edit'];
const tools = [
  { label: 'Add', value: 'add' },
  { label: 'Edit', value: 'edit' },
];

export const Tab = () => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);
  const numberPressed = useAtomValue(numberPressedAtom);

  // Keyboard shortcut to switch between tools (Alt + 1, 2 ...)
  useEffect(() => {
    if (!numberPressed) return;
    numberPressed <= 2 && setActiveTool(tools[numberPressed - 1].value);
  }, [numberPressed]);

  return (
    <div className='absolute -top-5 left-0 z-10 w-fit px-4 py-2 pt-4 rounded-b-2xl mt-2 ms-5 bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 shadow-lg shadow-neutral-500/80  dark:text-neutral-900 transition-all duration-300 ease-in-out'>
      <div className='flex gap-4 items-center'>
        {tools.map((tool, i) => (
          <button
            key={i}
            className={`px-3 py-2 hover:cursor-pointer rounded-md ${
              tool.value === activeTool
                ? 'ring-2 dark:ring-neutral-800/40 rounded-lg'
                : 'hover:ring hover:ring-neutral-200 dark:hover:ring-neutral-700 dark:hover:text-neutral-300'
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
