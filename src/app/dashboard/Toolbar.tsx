'use client';

import { cursorTypeAtom, insertAtom } from '@/utils/atoms';
import { useSetAtom } from 'jotai';
import { CursorTypes } from '@/utils/constants';

export const Toolbar = () => {
  const setCursor = useSetAtom(cursorTypeAtom);
  const setInsert = useSetAtom(insertAtom);

  return (
    <header>
      <div className='py-4 px-6 text-neutral-300 bg-neutral-700 w-full'>
        <div className='flex justify-between gap-4 w-[90%]'>
          <button
            className='hover:cursor-pointer'
            onClick={() => {
              setInsert('wall');
              setCursor((prev) => (prev === CursorTypes.PENCIL ? CursorTypes.DEFAULT : CursorTypes.PENCIL));
            }}
          >
            Wall
          </button>
          <button
            className='hover:cursor-pointer'
            onClick={() => {
              setInsert('furnish');
              setCursor(CursorTypes.POINTER);
            }}
          >
            Furnish
          </button>
          <button
            className='hover:cursor-pointer'
            onClick={() => {
              setInsert('export');
              setCursor(CursorTypes.DEFAULT);
            }}
          >
            Export
          </button>
        </div>
      </div>
    </header>
  );
};
