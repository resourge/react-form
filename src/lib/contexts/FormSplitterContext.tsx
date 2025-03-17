import { createContext, useContext } from 'react';

import { useBaseContext } from '../hooks/useBaseContext';
import { type FormContextType, type UseFormSplitterResult } from '../types/formTypes';

export const FormSplitterContext = createContext<FormContextType<any, any> | null>(null);

export const useBaseFormSplitterContext = <T extends object>(): FormContextType<T> => useContext(FormSplitterContext) as unknown as FormContextType<T>;

export const useFormSplitterContext = <T extends object>(): UseFormSplitterResult<T> => useBaseContext<T, 'formSplitter'>(
	useBaseFormSplitterContext<T>()
) as unknown as UseFormSplitterResult<T>;
