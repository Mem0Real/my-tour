'use client';

import React from 'react';

import { useAtomValue } from 'jotai';
import { activeTabAtom } from '@/utils/atoms/design';
import { EditInterface } from '@/app/dashboard/components/EditInterface';
import { AddInterface } from '@/app/dashboard/components/AddInterface';

export const Tools = () => {
  const activeTab = useAtomValue(activeTabAtom);

  switch (activeTab) {
    case 'Add':
      return <AddInterface />;
    case 'Edit':
      return <EditInterface />;

    default:
      return;
  }
};
