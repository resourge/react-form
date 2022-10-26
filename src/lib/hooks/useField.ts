import { FormContextObject } from '../contexts';
import { ControllerField } from '../contexts/ControllerContext';
import { FormKey } from '../types/FormKey';
import {
	FieldOptions,
	FormErrors,
	Touches,
	FieldForm,
	FormState
} from '../types/types'

import { useProxy } from './useProxy';

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
