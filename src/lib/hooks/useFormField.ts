import { useFormContext } from '../contexts/FormContext'
import { FormKey } from '../types/FormKey';
import { FieldOptions, FieldForm, FormState } from '../types/types';

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
	field: FieldForm
	formState: FormState<T>
} => {
	const formState = useFormContext<T>();

	const field = formState[1].field<Value>(key, options);

	return {
		field,
		formState
	}
}
