import { Children } from '@/utils/definitions';
import { Layout } from '@/3D/Layout';
import { Footer } from '@/app/dashboard/Footer';
import { KeyboardListener } from '@/app/helpers/KeyboardDetector';

export default function DashLayout({ children }: Children) {
  return (
    <div className='flex flex-col w-full h-screen relative overflow-hidden'>
      <KeyboardListener />
      <Layout className='flex-1 relative overflow-hidden'>{children}</Layout>
      <Footer />
    </div>
  );
}
