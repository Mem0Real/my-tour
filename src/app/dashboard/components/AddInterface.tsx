import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { insertAtom } from '@/utils/atoms/ui';

const items = ['Wall', 'Door', 'Window'];

export const AddInterface = () => {
  const [insert, setInsert] = useAtom(insertAtom);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className='fixed left-0 top-1/3 -translate-y-1/2 w-fit bg-neutral-400/80 text-neutral-900 rounded-r-lg shadow-lg transition-all duration-300 ease-in-out z-10'>
      {/* Toggle Button */}
      <button
        className='absolute -right-8 top-2 rounded-r-lg p-2  bg-neutral-400 hover:bg-neutral-500 cursor-pointer'
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* Sidebar Content */}
      <div className={`${isCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-32 p-4'} transition-all duration-200`}>
        <ul className='space-y-2'>
          {items.map((item) => (
            <li key={item}>
              <button
                className={`w-full text-left px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer ${
                  insert === item ? 'bg-blue-500 text-white' : '  bg-neutral-400 hover:bg-neutral-500'
                }`}
                onClick={() => setInsert(item)}
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
