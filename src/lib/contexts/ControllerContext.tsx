import { createContext, useContext } from 'react';

export type ControllerContextObject = {
	name: string
};

export const ControllerContext = createContext<ControllerContextObject | null>(null);

export const useControllerContext = () => useContext(ControllerContext);
