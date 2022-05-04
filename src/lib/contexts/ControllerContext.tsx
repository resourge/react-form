import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { FormKey } from '../types'
import { FormState, FieldForm, FormNestedErrors } from '../types/types'

export type ControllerField<
	T extends Record<string, any>,
	Value = any,
	Name extends string = FormKey<T>
> = FieldForm<Value, Name> & {
	/**
	 * 
	 */
	errors: FormNestedErrors<Value>
}

export type ControllerContextObject<
	T extends Record<string, any>,
	Value = any,
	Name extends string = FormKey<T>
> = {
	field: ControllerField<T, Value, Name>
	formState: FormState<T>
}

// @ts-expect-error I want the validation on the useController
export const ControllerContext = createContext<ControllerContextObject<any, any, any>>(null);

export const useController = <
	T extends Record<string, any>, 
	Value = any,
	Name extends string = FormKey<T>
>(): ControllerContextObject<T, Value, Name> => {
	const context = useContext(ControllerContext)

	invariant(context, 'useControllerContext can only be used in the context of a <Controller> component.')

	return context as ControllerContextObject<T, Value, Name>
}
