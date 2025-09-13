import { CanvasBase } from '@/3D/base/CanvasBase';
import { Environment } from '@/3D/base/Environment';
import { Scene } from '@/3D/base/Scene';
import { Navbar } from '@/app/components/Navbar';

export default function Home() {
  return (
    <div className='viewer-container'>
      <Navbar />
      <CanvasBase>
        <Environment />
        <Scene />
      </CanvasBase>
    </div>
  );
}
