'use client';

import { useAtom } from 'jotai';
import { activeToolAtom } from '@/utils/atoms/ui';

import { Tab } from '@/app/dashboard/components/Tab';
import { Sidebar } from '@/app/dashboard/components/Sidebar';
import { AddInterface } from '@/3D/dashboard/AddInterface';
import { EditInterface } from '@/3D/dashboard/EditInterface';
import { Base } from '@/3D/dashboard/components/Base';
import { Platform } from '@/3D/dashboard/Platform';
import { Children } from '@/utils/definitions';
import { Three } from '@/3D/base/Three';
import { useEffect } from 'react';

const ActiveInterface = ({ children }: Children) => {
  const [activeTool] = useAtom(activeToolAtom);
  switch (activeTool) {
    case 'Add':
      return <AddInterface>{children}</AddInterface>;
    case 'Edit':
      return <EditInterface>{children}</EditInterface>;
  }
};

const Dashboard = () => {

  useEffect(() => {
    console.log("[Load] Dashboard");
  }, [])
  return (
    <>
      <Tab />
      <Sidebar />
      
      <Three>
        <ActiveInterface>
          <Base />
          <Platform />
        </ActiveInterface>
      </Three>
    </>
  );
};
export default Dashboard;
