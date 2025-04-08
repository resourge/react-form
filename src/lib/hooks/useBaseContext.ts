import { type UseFormReturn, type UseFormSplitterResult } from '../types';
import { type FormContextType } from '../types/formTypes';

import { useFormCore } from './useFormCore';

export const useBaseContext = <
	T extends Record<string, any>
>(context: FormContextType<T>): UseFormReturn<T, 'formContext'> | UseFormSplitterResult<T> => useFormCore<T, 'formContext'>({
	context,
	type: 'formContext',
	value: context.formState.form
}) as unknown as UseFormReturn<T, 'formContext'> | UseFormSplitterResult<T>;
