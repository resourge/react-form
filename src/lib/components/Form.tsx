import { type JSX } from 'react';

import { type SubmitHandler } from '../types';

import { FormProvider, type FormProviderProps } from './FormProvider';

export type FormProps<T extends Record<string, any>> = FormProviderProps<T> 
	& Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>
	& {
		onSubmit?: SubmitHandler<T, any>
	};

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
 * <Form context={context) onSubmit={...}>
 * 	...
 * </Form>
 * ```
 */
export const Form = <T extends Record<string, any>>({
	children, context, onSubmit, ...formProps 
}: FormProps<T>): JSX.Element => {
	return (
		<FormProvider 
			context={context}
		>
			<form 
				{...formProps}
				onSubmit={onSubmit ? context.formState.handleSubmit(onSubmit) : undefined}
			>
				{ children }
			</form>
		</FormProvider>
	);
};
