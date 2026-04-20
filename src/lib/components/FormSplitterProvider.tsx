import { type JSX, type PropsWithChildren } from 'react';

import { FormSplitterContext } from '../contexts/FormSplitterContext';
import { type FormContextType } from '../types/formTypes';
import { IS_DEV } from '../utils/constants';

export type FormSplitterProviderProps<T extends Record<string, any>> = PropsWithChildren<{
	context: FormContextType<T, 'formSplitter'>
}>;

/**
 * Provider component for deep `form splitter's` 
 * @example
 * ```Typescript
 * const {
 *	 context
 * } = useFormSplitter(
 *	 ...
 * )
 * 
 * <FormSplitterProvider context={context)>
 * 	...
 * </FormSplitterProvider>
 * ```
 */
const FormSplitterProvider = <T extends Record<string, any>>({ children, context }: FormSplitterProviderProps<T>): JSX.Element => {
	if ( IS_DEV && context.type !== 'formSplitter' ) {
		throw new Error(`Can only accepts 'context' from the 'useFormSplitter'. For 'useFrom' context use '<FormContext>'|'<Form>'.`);
	}
	return (
		<FormSplitterContext.Provider value={context}>
			{ children }
		</FormSplitterContext.Provider>
	);
};

export default FormSplitterProvider;
