import { createContext, useContext } from 'react';

import { type UseFormReturn } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

import { ControllerContext } from './ControllerContext';

export type FormContextObject<T extends Record<string, any>> = UseFormReturn<T>;

export const FormContext = createContext<FormContextObject<Record<string, any>> | null>(null);

export const useFormContext = <T extends object>(): UseFormReturn<T> => {
	const context = useContext(FormContext) as unknown as UseFormReturn<T>;

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
