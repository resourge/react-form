import { FormContext, type FormContextObject } from '../contexts/FormContext';

export type FormProviderProps<T extends Record<string, any>> = React.PropsWithChildren<{
	context: FormContextObject<T>
}>

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
export const FormProvider = <T extends Record<string, any>>({ children, context }: FormProviderProps<T>) => (
	<FormContext.Provider value={context as FormContextObject<Record<string, any>>}>
		{ children }
	</FormContext.Provider>
);
