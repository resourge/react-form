import { createContext, useContext } from 'react';

import { type UseFormReturn } from '../types';
import { IS_DEV } from '../utils/constants';

export type ControllerContextObject<
	T extends Record<string, any>,
> = {
	context: UseFormReturn<T, any>
	name: string
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const ControllerContext = createContext<ControllerContextObject<any>>(null!);

export const useControllerContext = <
	T extends Record<string, any>
>(): ControllerContextObject<T> => useContext(ControllerContext);

const useControllerBase = <
	T extends Record<string, any>
>(): ControllerContextObject<T> => {
	const context = useControllerContext();

	if ( IS_DEV ) {
		if ( !context ) {
			throw new Error('useControllerContext can only be used in the context of a <Controller> component.');
		}
	}

	return context as unknown as ControllerContextObject<T>;
};

export const useController = <
	T extends Record<string, any>
>(): UseFormReturn<T> => useControllerBase<T>().context;
