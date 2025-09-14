import { Children } from '@/utils/definitions';
import { Toolbar } from '@/app/dashboard/Toolbar';
import { Layout } from '@/3D/Layout';

export default function DashLayout({ children }: Children) {
  return (
    <div className='flex flex-col h-full'>
      <Toolbar />
      <Layout>{children}</Layout>
    </div>
  );
}
