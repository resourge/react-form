import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { FormContextObject } from './FormContext'

export type ControllerContextObject<
	T extends Record<string, any>,
> = FormContextObject<T>

// @ts-expect-error I want the validation on the useController
export const ControllerContext = createContext<ControllerContextObject<any, any, any>>(null);

export const useControllerContext = <
	T extends Record<string, any>
>(): ControllerContextObject<T> => {
	return useContext(ControllerContext)
}

export const useController = <
	T extends Record<string, any>
>(): ControllerContextObject<T> => {
	const context = useControllerContext()

	if ( __DEV__ ) {
		invariant(context, 'useControllerContext can only be used in the context of a <Controller> component.')
	}

	return context as unknown as ControllerContextObject<T>
}
