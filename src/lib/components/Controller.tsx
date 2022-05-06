/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import React, { memo, MutableRefObject } from 'react';

import { ControllerContext } from '../contexts/ControllerContext';
import { FormContextObject } from '../contexts/FormContext';
import { useField } from '../hooks/useField';
import { FormKey } from '../types/FormKey';

export type ControllerProps<T extends Record<string, any>> = {
	name: FormKey<T>
	context: FormContextObject<T>
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
 * const {
 *	 context
 * } = useForm({
 *   name: 'Rimuru'
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
	name, context, children 
}: ControllerProps<T>) {
	const field = useField<T, any, any>(
		context,
		name
	)

	return (
		<ControllerContext.Provider
			value={{
				field,
				formContext: context as FormContextObject<T>
			}}
		>
			{ children }
		</ControllerContext.Provider>
	);
}, (prevProps, nextProps) => {
	// @ts-expect-error // I want this to only be visible to the Controller
	const changedKeys = nextProps.context._changedKeys as MutableRefObject<Set<FormKey<any>>>
	
	const keys = [...changedKeys.current.keys()]

	const key = keys
	.find((currentTouche) => currentTouche.includes(nextProps.name) || nextProps.name.includes(currentTouche))

	if ( key ) {
		changedKeys.current.delete(key);
	}

	return (
		prevProps.name === nextProps.name && !(key)
	)
}) as <T extends Record<string, any>>(props: ControllerProps<T>) => JSX.Element
