import { createContext, useContext } from 'react';

import { IS_DEV } from '../utils/constants';

import { type FormContextObject } from './FormContext';

export type ControllerContextObject<
	T extends Record<string, any>,
> = {
	context: FormContextObject<T>
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
>(): FormContextObject<T> => useControllerBase<T>().context;
