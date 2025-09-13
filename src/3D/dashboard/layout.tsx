import type { Metadata } from 'next';
import { Children } from '@/utils/definitions';
import { DashNav } from '@/3D/dashboard/DashNav';

export default function DashLayout({ children }: Children) {
  return (
    <div className='flex flex-col h-full'>
      <DashNav />
      {children}
    </div>
  );
}
