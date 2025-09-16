'use client';

import React from 'react';

import { useAtomValue } from 'jotai';
import { activeTabAtom } from '@/utils/atoms/design';
import { EditInterface } from '@/app/dashboard/components/EditInterface';
import { AddInterface } from '@/app/dashboard/components/AddInterface';

export const Tools = () => {
  const activeTab = useAtomValue(activeTabAtom);

  return activeTab === 'Add' ? <AddInterface /> : <EditInterface />;
};
