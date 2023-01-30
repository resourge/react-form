/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { UseFormReturn } from '../types/types'

import { ControllerContext } from './ControllerContext';

export type FormContextObject<T extends Record<string, any>> = UseFormReturn<T>;

// @ts-expect-error I want the validation on the useFormContext
export const FormContext = createContext<FormContextObject<Record<string, any>>>(null);

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
