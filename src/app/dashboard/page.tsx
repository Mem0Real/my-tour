'use client';

import { Common } from '@/3D/base/Common';
import { Three } from '@/3D/base/Three';
import { cursorTypeAtom, insertAtom } from '@/utils/atoms';
import { CursorTypes } from '@/utils/constants';
import { Grid, useCursor } from '@react-three/drei';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const insert = useAtomValue(insertAtom);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (insert === 'wall' && hovered) {
      document.body.style.cursor = 'url("/pencil.svg") 0 24, auto';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [insert, hovered]);

  return (
    <div className={`w-full flex flex-col justify-center `}>
      <Three>
        <Grid
          renderOrder={-1}
          position={[0, 1, 0]}
          cellSize={1}
          sectionSize={1}
          sectionColor={'#D0D0CF'}
          sectionThickness={1}
          infiniteGrid={true}
        />
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0.01, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Three>
      <Common />
    </div>
  );
};

export default Dashboard;
