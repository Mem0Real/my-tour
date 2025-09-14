'use client';

import { Common } from '@/3D/base/Common';
import { Three } from '@/3D/base/Three';
import { Grid } from '@react-three/drei';

import { Board } from '@/app/dashboard/Board';

const Dashboard = () => {
  return (
    <div className={`w-full flex flex-col justify-center `}>
      <Three>
        <Grid
          renderOrder={-1}
          position={[0, -0.01, 0]}
          cellSize={1}
          sectionSize={1}
          sectionColor={'#D0D0CF'}
          sectionThickness={1}
          infiniteGrid={true}
        />
        <Board />
      </Three>
      <Common />
    </div>
  );
};

export default Dashboard;
