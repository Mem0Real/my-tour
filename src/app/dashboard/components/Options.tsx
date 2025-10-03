'use client';

import { wallHeightAtom, wallThicknessAtom } from '@/utils/atoms/ui';
import { useAtom } from 'jotai';

export const Options = () => {
  const [wallHeight, setWallHeight] = useAtom(wallHeightAtom);
  const [wallThickness, setWallThickness] = useAtom(wallThicknessAtom);

  const handleChange = (e: React.FocusEvent<HTMLInputElement, Element>, entry: string) => {
    const value = parseFloat(e.currentTarget.value);
    switch (entry) {
      case 'height':
        if (value !== wallHeight) setWallHeight(value / 100);
        break;

      case 'thickness':
        if (value !== wallThickness) setWallThickness(value / 100);
    }
  };
  return (
    <div className='absolute -top-2 right-5 z-10 w-fit px-4 py-2 pt-4 rounded-b-2xl mt-2 ms-5 bg-neutral-800/80 text-neutral-200 dark:bg-neutral-200/80 shadow-lg shadow-neutral-500/80  dark:text-neutral-900 transition-all duration-300 ease-in-out'>
      <div className='flex flex-col gap-4 justify-center items-start text-sm'>
        <span className='flex gap-2 items-center'>
          <label htmlFor='wallHeight'>Wall Height: </label>
          <input
            id='wallHeight'
            type='text'
            className='w-12 text-center'
            defaultValue={wallHeight * 100}
            onBlur={(e) => handleChange(e, 'height')}
          />
          <p className='text-xs italic'>cm</p>
        </span>
        <span className='flex gap-2 items-center'>
          <label htmlFor='wallThickness'>Wall Thickness: </label>
          <input
            id='wallThickness'
            type='text'
            className='w-12 text-center'
            defaultValue={wallThickness * 100}
            onBlur={(e) => handleChange(e, 'thickness')}
          />
          <p className='text-xs italic'>cm</p>
        </span>
      </div>
    </div>
  );
};
