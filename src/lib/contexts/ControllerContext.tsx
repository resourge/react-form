import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { FormState, FieldForm } from '../types/types'

export type ControllerField<T extends Record<string, any>, Value = any> = {
	field: FieldForm<Value>
	formState: FormState<T>
}

// @ts-expect-error I want the validation on the useController
export const ControllerContext = createContext<ControllerField<any>>(null);

export const useController = <T extends Record<string, any>, Value = any>(): ControllerField<T, Value> => {
	const context = useContext(ControllerContext)

	invariant(context, 'useControllerContext can only be used in the context of a <Controller> component.')

	return context as ControllerField<T, Value>
}
