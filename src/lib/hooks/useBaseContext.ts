import { type UseFormReturn, type UseFormSplitterResult } from '../types';
import { type FormTypes, type FormContextType } from '../types/formTypes';
import { TARGET_VALUE } from '../utils/observeObject/observeObject';

import { useFormCore } from './useFormCore';

export const useBaseContext = <
	T extends Record<string, any>, 
	FT extends FormTypes = 'form'
>(context: FormContextType<T>): UseFormReturn<T, FT> | UseFormSplitterResult<T> => useFormCore<T, 'formSplitter'>({
	context,

	defaultValue: () => (context.formState.form as any)[TARGET_VALUE] as T,
	type: 'formSplitter'
}) as unknown as UseFormReturn<T, FT> | UseFormSplitterResult<T>;
