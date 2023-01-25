import { useFormContext, FormContextObject } from '../contexts/FormContext'
import { FormKey } from '../types/FormKey';
import { FieldOptions } from '../types/types';

import { ControllerField, useField } from './useField';

/**
 * Hook to use in components inside `FormContext`
 * 
 * @param key - key from `form` state 
 * @param options - {@link FieldOptions}
 */
export const useFormField = <T extends Record<string, any>, Value = any>(
	key: FormKey<T>, 
	options?: FieldOptions
): {
	field: ControllerField<T, Value>
	formContext: FormContextObject<T>
} => {
	const formContext = useFormContext<T>();

	const field = useField<T, Value>(
		formContext,
		key,
		options
	)

	return {
		field,
		formContext
	}
}
