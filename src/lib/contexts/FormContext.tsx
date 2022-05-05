/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { FormState } from '../types/types'

// @ts-expect-error I want the validation on the useFormContext
export const FormContext = createContext<FormState<Record<string, any>>>(null);

export const useFormContext = <T extends object>(): FormState<T> => {
	const context = useContext(FormContext) as unknown as FormState<T>

	invariant(context, 'useFormContext can only be used in the context of a <FormProvider> component.')

	return context
}
