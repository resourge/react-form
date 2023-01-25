import { FormContextObject } from '../contexts';
import { FormKey } from '../types/FormKey';
import {
	FieldOptions,
	FormErrors,
	Touches,
	FieldForm,
	FormState
} from '../types/types'

import { useProxy } from './useProxy';

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

export const useField = <
	T extends Record<string, any>, 
	Value = any,
	Name extends string = FormKey<T>
>(
	context: FormContextObject<T>,
	name: FormKey<T>,
	options?: FieldOptions<Value>
): ControllerField<T, Value, Name> => {
	const field = context.field(name, options) as FieldForm<Value, Name>;

	const fieldState = useProxy<T>(
		context.errors as unknown as FormErrors<T>,
		context.touches as unknown as Touches<T>,
		name
	) as unknown as FormState<Value>

	return {
		...field,
		fieldState
	}
}
