import React, { memo } from 'react';

import { FormKey, FormState } from '../types';

import { FormProvider } from './FormProvider';

export type ControllerProps<T extends Record<string, any>> = {
	name: FormKey<T>
	context: FormState<T>
	children: React.ReactNode
}

/**
 * Component `Controller` that only updates children if the 
 * key `name` changes.
 * Serves to increase performance in form's with large
 * amounts of elements or components by only updating the children
 * in case the value is `touched`.
 * 
 * * Note: The children will still render, it only prevents rerenders.
 * 
 * @param name - key from `form` state
 * @param context - form context value
 * @example
 * ```Typescript
 * const [
 *  	{
 *			context
 *		}
 * ] = useForm({
 * 		name: 'Rimuru'
 * })
 * return (
 *		<Controller
 *			name='name'
 *			context={context}
 *		>
 *			...
 *		</Controller>
 * )
 * ```
 */
export const Controller = memo(function Controller<T extends Record<string, any>>({ 
	context, children 
}: ControllerProps<T>) {
	return (
		<FormProvider context={context}>
			{ children }
		</FormProvider>
	);
}, (prevProps, nextProps) => (
	prevProps.name === nextProps.name && !(
		(nextProps.context[0].touches.currentTouches[nextProps.name] ?? false) ||
		nextProps.context[0].touches.currentTouches.some((currentTouche) => currentTouche.includes(nextProps.name) || nextProps.name.includes(currentTouche))
	)
)) as <T extends Record<string, any>>(props: ControllerProps<T>) => JSX.Element
