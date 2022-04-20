import React from 'react';

import { FormContext } from '../contexts/FormContext';
import { FormState } from '../types/types';

export type FormProviderProps = React.PropsWithChildren<{
	context: FormState<any>
}>

/**
 * Provider component for deep `form's` 
 * @example
 * ```Typescript
 * const [
 *	 {
 *		 context
 *	 }
 * ] = useForm(
 *	 ...
 * )
 * 
 * <FormProvider context={context)>
 * 	...
 * </FormProvider>
 * ```
 */
export const FormProvider: React.FC<FormProviderProps> = ({ children, context }: FormProviderProps) => (
	<FormContext.Provider value={context}>
		{ children }
	</FormContext.Provider>
);
