import React from 'react';

import { FormContext } from '../contexts/FormContext';
import { FormState } from '../types/types';

export type FormProviderProps<T extends Record<string, any>> = React.PropsWithChildren<{
	context: FormState<T>
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
export const FormProvider = <T extends Record<string, any>>({ children, context }: FormProviderProps<T>) => (
	<FormContext.Provider value={context as any}>
		{ children }
	</FormContext.Provider>
);
