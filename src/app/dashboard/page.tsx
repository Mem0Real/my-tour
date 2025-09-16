'use client';

import { useAtom } from 'jotai';
import { activeToolAtom } from '@/utils/atoms/ui';

import { Tab } from '@/app/dashboard/components/Tab';
import { Base } from '@/3D/dashboard/components/Base';
import { Sidebar } from '@/app/dashboard/components/Sidebar';
import { AddInterface } from '@/3D/dashboard/AddInterface';
import { EditInterface } from '@/3D/dashboard/EditInterface';

const Dashboard = () => {
  const [activeTool] = useAtom(activeToolAtom);

  const ActiveInterface = () => {
    switch (activeTool) {
      case 'Add':
        return (
          <>
            <Sidebar />
            <AddInterface />
          </>
        );
      case 'Edit':
        return <EditInterface />;
      default:
        return;
    }
  };

  return (
    <>
      <Tab />
      <Base />
      <ActiveInterface />
    </>
  );
};

export default Dashboard;
