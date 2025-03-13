import { type JSX } from 'react';

import { FormContext } from '../contexts/FormContext';
import { type FormContextType } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

export type FormProviderProps<T extends Record<string, any>> = React.PropsWithChildren<{
	context: FormContextType<T, 'form'>
}>;

/**
 * Provider component for deep `form's` 
 * @example
 * ```Typescript
 * const {
 *	 context
 * } = useForm(
 *	 ...
 * )
 * 
 * <FormProvider context={context)>
 * 	...
 * </FormProvider>
 * ```
 */
export const FormProvider = <T extends Record<string, any>>({ children, context }: FormProviderProps<T>): JSX.Element => {
	if ( IS_DEV ) {
		if ( context.type !== 'form' ) {
			throw new Error(`Can only accepts 'context' from the 'useFrom'. For 'useFormSplitter' context use '<FormSplitterContext>'.`);
		}
	}
	return (
		<FormContext.Provider value={context}>
			{ children }
		</FormContext.Provider>
	);
};
