'use client';

import React from 'react';

import { useAtomValue } from 'jotai';
import { activeTabAtom } from '@/utils/atoms/design';
import { EditInterface } from '@/app/dashboard/components/EditInterface';
import { AddInterface } from '@/app/dashboard/components/AddInterface';
import { Sidebar } from '@/app/dashboard/components/Sidebar';
import { Three } from '@/3D/base/Three';

export const Tools = () => {
  const activeTab = useAtomValue(activeTabAtom);

  switch (activeTab) {
    case 'Add':
      return (
        <>
          <Sidebar />
          <Three>
            <AddInterface />
          </Three>
        </>
      );
    case 'Edit':
      return <EditInterface />;

    default:
      return;
  }
};
