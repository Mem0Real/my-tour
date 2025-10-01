import { ThemeToggle } from '@/app/components/ThemeToggle';
import React from 'react';

export const Navbar = () => {
  return (
    <header>
      <div className='py-2 px-6 text-neutral-300 bg-neutral-800 dark:shadow-sm shadow-black border-white w-full'>
        <div className='flex justify-between items-center w-full'>
          <h1 className='text-italic text-base font-black'>My Tour</h1>
          <div className='flex items-center gap-8'>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
