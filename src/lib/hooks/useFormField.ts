import { ControllerField } from '../contexts/ControllerContext';
import { useFormContext } from '../contexts/FormContext'
import { FormKey } from '../types/FormKey';
import { FieldOptions, FormState, FormActions } from '../types/types';

import { useField } from './useField';

/**
 * Hook to use in components inside `FormContext`
 * 
 * @param key - key from `form` state 
 * @param options - {@link FieldOptions}
 * @returns 
 */
export const useFormField = <T extends Record<string, any>, Value = any>(
	key: FormKey<T>, 
	options?: FieldOptions
): {
	field: ControllerField<T, Value>
	formState: FormState<T> & FormActions<T>
} => {
	const formState = useFormContext<T>();

	const field = useField<T, Value>(
		formState,
		key,
		options
	)

	return {
		field,
		formState: formState as FormState<T> & FormActions<T>
	}
}
