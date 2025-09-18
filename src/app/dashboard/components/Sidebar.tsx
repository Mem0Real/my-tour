import React, { useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeToolAtom, cursorTypeAtom, insertAtom, toolsCollapsedAtom } from '@/utils/atoms/ui';
import { CursorTypes } from '@/utils/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const items = ['Wall', 'Door', 'Window'];

export const Sidebar = () => {
  const [insert, setInsert] = useAtom(insertAtom);
  const [isCollapsed, setIsCollapsed] = useAtom(toolsCollapsedAtom);
  const activeTool = useAtomValue(activeToolAtom);

  const setCursor = useSetAtom(cursorTypeAtom);

  useEffect(() => {
    if (activeTool !== 'add') setIsCollapsed(true);
    else setCursor(insert ? CursorTypes.CROSS : CursorTypes.DEFAULT);
  }, [insert, activeTool]);

  return (
    <div className='fixed left-0 top-1/3 -translate-y-1/2 w-fit bg-neutral-200/40 dark:bg-neutral-200/80 shadow-lg shadow-neutral-600 border-r border-t border-neutral-500 text-neutral-900 rounded-r-sm transition-all duration-300 ease-in-out z-10 py-2'>
      {/* Toggle Button */}
      <button
        className='absolute -right-8 top-2 rounded-r-lg p-2  bg-neutral-400 hover:bg-neutral-500 cursor-pointer'
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={18} color='#212122' /> : <ChevronLeft size={18} color='#212122' />}
      </button>

      {/* Sidebar Content */}
      <div className={`${isCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-32 p-4'} transition-all duration-200`}>
        <ul className='space-y-2'>
          {items.map((item) => (
            <li key={item}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer disabled:bg-neutral-500/80 disabled:text-neutral-300 disabled:cursor-auto ${
                  insert === item
                    ? 'ring-2 ring-neutral-800/40 rounded-lg'
                    : 'hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-300'
                }`}
                onClick={() => setInsert((prev) => (prev === item ? '' : item))}
                disabled={activeTool !== 'add'}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
