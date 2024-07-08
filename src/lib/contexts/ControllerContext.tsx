import { createContext, useContext } from 'react';

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
>(): ControllerContextObject<T> => {
	return useContext(ControllerContext);
};

const useControllerBase = <
	T extends Record<string, any>
>(): ControllerContextObject<T> => {
	const context = useControllerContext();

	if ( process.env.NODE_ENV === 'development' ) {
		if ( !context ) {
			throw new Error('useControllerContext can only be used in the context of a <Controller> component.');
		}
	}

	return context as unknown as ControllerContextObject<T>;
};

export const useControllerName = <
	T extends Record<string, any>
>(): string => {
	return useControllerBase<T>().name;
};

export const useController = <
	T extends Record<string, any>
>(): FormContextObject<T> => {
	return useControllerBase<T>().context;
};
