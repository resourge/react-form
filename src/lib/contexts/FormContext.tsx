/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { type UseFormReturn } from '../types/formTypes'

import { ControllerContext } from './ControllerContext';

export type FormContextObject<T extends Record<string, any>> = UseFormReturn<T>;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const FormContext = createContext<FormContextObject<Record<string, any>>>(null!);

export const useFormContext = <T extends object>(): UseFormReturn<T> => {
	const context = useContext(FormContext) as unknown as UseFormReturn<T>

	if ( __DEV__ ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const controllerContext = useContext(ControllerContext);

		invariant(!(controllerContext), 'Don\'t use useFormContext inside a Controller component as it will defeat the purpose of a Controller component.')

		invariant(context, 'useFormContext can only be used in the context of a <FormProvider> component.')
	}

	return context
}
