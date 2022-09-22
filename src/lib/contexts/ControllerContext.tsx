import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { FormKey } from '../types'
import { FormState, FieldForm } from '../types/types'

import { FormContextObject } from './FormContext'

export type ControllerField<
	T extends Record<string, any>,
	Value = any,
	Name extends string = FormKey<T>
> = FieldForm<Value, Name> & {
	/**
	 * Nested object that has information on the `key`
	 */
	fieldState: FormState<Value>
}

export type ControllerContextObject<
	T extends Record<string, any>,
	Value = any,
	Name extends string = FormKey<T>
> = {
	field: ControllerField<T, Value, Name>
	formContext: FormContextObject<T>
}

// @ts-expect-error I want the validation on the useController
export const ControllerContext = createContext<ControllerContextObject<any, any, any>>(null);

export const useController = <
	T extends Record<string, any>,
	Name extends FormKey<T> = any
>(): ControllerContextObject<T, T[Name], Name> => {
	const context = useContext(ControllerContext)

	if ( __DEV__ ) {
		invariant(context, 'useControllerContext can only be used in the context of a <Controller> component.')
	}

	return context as unknown as ControllerContextObject<T, T[Name], Name>
}
