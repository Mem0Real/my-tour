import { CanvasBase } from '@/3D/CanvasBase';
import { Environment } from '@/3D/Environment';
import { Scene } from '@/3D/Scene';
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
