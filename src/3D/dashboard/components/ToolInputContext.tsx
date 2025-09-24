import { ToolHandlers } from '@/utils/definitions';
import { createContext, useContext } from 'react';

const ToolInputContext = createContext<ToolHandlers>({});
export const useToolInput = () => useContext(ToolInputContext);
export const ToolInputProvider = ToolInputContext.Provider;
