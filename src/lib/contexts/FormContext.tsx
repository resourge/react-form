import { createContext, useContext } from 'react';

import { useBaseContext } from '../hooks/useBaseContext';
import { type FormContextType, type UseFormReturn } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

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

export const useFormContext = <T extends object>(): UseFormReturn<T> => useBaseContext<T, 'formSplitter'>(
	useBaseFormContext<T>()
) as unknown as UseFormReturn<T>;
