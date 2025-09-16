import { Children } from '@/utils/definitions';
import { Toolbar } from '@/app/dashboard/Toolbar';
import { Layout } from '@/3D/Layout';
import { Footer } from '@/app/dashboard/Footer';
import { KeyboardListener } from '@/app/helpers/KeyboardDetector';

// DashLayout.tsx
export default function DashLayout({ children }: Children) {
  return (
    <div className="flex flex-col w-full h-screen relative overflow-hidden">  {/* h-screen + overflow-hidden */}
      <KeyboardListener />
      <Toolbar />
      <Layout className="flex-1 relative overflow-hidden"> 
        {children}
      </Layout>
      <Footer />
    </div>
  );
}
