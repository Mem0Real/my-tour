import Link from 'next/link';
import React from 'react';

export const Navbar = () => {
  return (
    <header>
      <div className='py-4 px-6 text-neutral-300 bg-neutral-800 w-full'>
        <div className='flex justify-between w-[90%]'>
          <h1 className='text-italic text-xl font-black'>My Tour</h1>
          <Link href='/'>Home</Link>
        </div>
      </div>
    </header>
  );
};
