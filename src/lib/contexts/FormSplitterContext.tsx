import { createContext, useContext } from 'react';

import { type UseFormSplitterResult } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

import { ControllerContext } from './ControllerContext';

export const FormSplitterContext = createContext<UseFormSplitterResult<any> | null>(null);

export const useFormSplitterContext = <T extends object>(): UseFormSplitterResult<T> => {
	const context = useContext(FormSplitterContext) as unknown as UseFormSplitterResult<T>;

	if ( IS_DEV ) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		if ( useContext(ControllerContext) ) {
			throw new Error('Don\'t use useFormContext inside a Controller component as it will defeat the purpose of a Controller component.');
		}
		if ( !context ) {
			throw new Error('useFormContext can only be used in the context of a <FormProvider> component.');
		}
	}

	return context;
};
