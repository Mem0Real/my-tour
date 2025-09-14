'use client';

import { Children } from '@/utils/definitions';

import { r3f } from '@/utils/globals';

export const Three = ({ children }: Children) => {
  return <r3f.In>{children}</r3f.In>;
};
