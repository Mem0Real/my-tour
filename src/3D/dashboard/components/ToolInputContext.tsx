import React, { createContext, useContext } from 'react';

export type ToolHandlers = {
  onPointerDown?: (e: any) => void;
  onPointerUp?: (e: any) => void;
  onPointerMove?: (e: any) => void;
  onRightClick?: (e: any) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
};

const ToolInputContext = createContext<ToolHandlers>({});
export const useToolInput = () => useContext(ToolInputContext);
export const ToolInputProvider = ToolInputContext.Provider;
