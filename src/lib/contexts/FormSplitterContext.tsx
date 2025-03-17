import { createContext, useContext } from 'react';

import { useFormCore } from '../hooks/useFormCore';
import { type UseFormSplitterResult, type FormContextType } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';
import { TARGET_VALUE } from '../utils/observeObject/observeObject';

export const FormSplitterContext = createContext<FormContextType<any, any> | null>(null);

export const useBaseFormSplitterContext = <T extends object>(): FormContextType<T> => useContext(FormSplitterContext) as unknown as FormContextType<T>;

export const useFormSplitterContext = <T extends object>(): UseFormSplitterResult<T> => {
	const context = useBaseFormSplitterContext<T>();

	if ( IS_DEV ) {
		if ( !context ) {
			throw new Error('useFormSplitterContext can only be used in the context of a <FormSplitterProvider> component.');
		}
	}

	return useFormCore<T, 'formSplitter'>({
		options: context.options,

		defaultValue: () => (context.formState.form as any)[TARGET_VALUE] as T,
		type: 'formSplitter'
	}) as UseFormSplitterResult<T>;
};
