import { createContext, useContext } from 'react';

import { useFormCore } from '../hooks/useFormCore';
import { type FormContextType, type UseFormReturn } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';
import { TARGET_VALUE } from '../utils/observeObject/observeObject';

export const FormContext = createContext<FormContextType<any, any> | null>(null);

export const useBaseFormContext = <T extends object>(): FormContextType<T> => {
	const context = useContext(FormContext) as FormContextType<T>;

	if ( IS_DEV ) {
		if ( !context ) {
			throw new Error('useFormContext can only be used in the context of a <FormProvider> component.');
		}
	}

	return context;
};

export const useFormContext = <T extends object>(): UseFormReturn<T> => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const context = useBaseFormContext<T>();

	return useFormCore<T, 'formSplitter'>({
		options: context.options,

		defaultValue: () => (context.formState.form as any)[TARGET_VALUE] as T,
		type: 'formSplitter'
	}) as unknown as UseFormReturn<T>;
};
