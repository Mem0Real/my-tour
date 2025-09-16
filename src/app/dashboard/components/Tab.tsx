'use client';

import React, { useEffect } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { activeTabAtom } from '@/utils/atoms/design';
import { keysPressedAtom } from '@/utils/atoms/ui';

const tabs = ['Add', 'Edit'];

export const Tab = () => {
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const keysPressed = useAtomValue(keysPressedAtom);

  // Keyboard shortcut to switch between tabs (Alt + 1, 2 ...)
  useEffect(() => {
    if (!keysPressed) return;
    setActiveTab(tabs[keysPressed - 1]);
  }, [keysPressed]);

  return (
    <div className='absolute top-0 left-0 z-10 w-fit px-4 py-2 rounded-lg mt-5 ms-5 bg-neutral-200/80 text-neutral-900'>
      <div className='flex gap-4 items-center'>
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`px-3 py-2 bg-neutral-400 hover:cursor-pointer rounded-lg ${
              tab === activeTab ? 'bg-blue-500 text-white' : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};
