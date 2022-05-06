/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { UseFormReturn } from '../types/types'

export type FormContextObject<T extends Record<string, any>> = UseFormReturn<T>;

// @ts-expect-error I want the validation on the useFormContext
export const FormContext = createContext<FormContextObject<Record<string, any>>>(null);

export const useFormContext = <T extends object>(): UseFormReturn<T> => {
	const context = useContext(FormContext) as unknown as UseFormReturn<T>

	invariant(context, 'useFormContext can only be used in the context of a <FormProvider> component.')

	return context
}
