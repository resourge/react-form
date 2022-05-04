import { ControllerField } from '../contexts/ControllerContext';
import { FormKey } from '../types/FormKey';
import { FieldOptions, FormState } from '../types/types';

import { useProxyError } from './useProxyError';

export const useField = <
	T extends Record<string, any>, 
	Value = any,
	Name extends string = FormKey<T>
>(
	context: FormState<T>,
	name: FormKey<T>,
	options?: FieldOptions<Value>
): ControllerField<T, Value, Name> => {
	const field = context.field<Value, Name>(name, options);

	const _errors = context[1].getErrors(name, { strict: false });

	const errors = useProxyError<Value>(
		{
			..._errors,
			[name]: [..._errors]
		},
		name
	)

	return {
		...field,
		errors
	}
}
