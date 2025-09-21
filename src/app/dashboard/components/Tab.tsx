'use client';

import React from 'react';

import { useAtom } from 'jotai';
import { activeToolAtom } from '@/utils/atoms/ui';

const tools = [
  { label: 'Add', value: 'add' },
  { label: 'Edit', value: 'edit' },
];

export const Tab = () => {
  const [activeTool, setActiveTool] = useAtom(activeToolAtom);

  return (
    <div className='absolute -top-5 left-0 z-10 w-fit px-4 py-2 pt-4 rounded-b-2xl mt-2 ms-5 bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 shadow-lg shadow-neutral-500/80  dark:text-neutral-900 transition-all duration-300 ease-in-out'>
      <div className='flex gap-4 items-center'>
        {tools.map((tool, i) => (
          <button
            key={i}
            className={`px-3 py-2 hover:cursor-pointer rounded-md ${
              tool.value === activeTool
                ? 'ring-2 dark:ring-neutral-800/40 rounded-lg'
                : 'hover:ring hover:ring-neutral-200 dark:hover:ring-neutral-700'
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
