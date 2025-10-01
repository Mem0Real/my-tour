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
import { KeyboardListener } from '@/app/dashboard/components/KeyboardListener';
import { Options } from '@/app/dashboard/components/Options';

const ActiveInterface = ({ children }: Children) => {
  const [activeTool] = useAtom(activeToolAtom);

  switch (activeTool) {
    case 'add':
      return (
        <>
          <Sidebar />
          <Three>
            <AddInterface>{children}</AddInterface>;
          </Three>
        </>
      );
    case 'edit':
      return (
        <Three>
          <EditInterface>{children}</EditInterface>
        </Three>
      );
  }
};

const Dashboard = () => {
  return (
    <>
      <KeyboardListener />
      <Tab />
      <Options />

      <ActiveInterface>
        <Base />
        <Platform />
      </ActiveInterface>
    </>
  );
};

export default Dashboard;
