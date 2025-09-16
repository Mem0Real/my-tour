import { Children } from '@/utils/definitions';
import { Toolbar } from '@/app/dashboard/Toolbar';
import { Layout } from '@/3D/Layout';
import { Footer } from '@/app/dashboard/Footer';

export default function DashLayout({ children }: Children) {
  return (
    <div className='flex flex-col h-full relative'>
      <Toolbar />
      <Layout>{children}</Layout>
      <Footer />
    </div>
  );
}
