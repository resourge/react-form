/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import React, { memo } from 'react';

import { ControllerContext } from '../contexts/ControllerContext';
import { FormContextObject } from '../contexts/FormContext';
import { useField } from '../hooks/useField';
import { FormKey } from '../types/FormKey';
import { UseFormReturnController } from '../types/types';

export type ControllerProps<T extends Record<string, any>> = {
	children: React.ReactNode
	context: FormContextObject<T>
	name: FormKey<T>
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
	// This is so "changedKeys" will only be visible
	// with types to the controller 
	const context = nextProps.context as UseFormReturnController<Record<string, any>>
	const changedKeys = context.changedKeys
	const keyToFind = nextProps.name;
	
	const keys = [...changedKeys.current.keys()];

	const shouldUpdate = keys.some((key) => (
		key.includes(keyToFind) || 
		keyToFind.includes(key)
	))

	return (
		prevProps.name === nextProps.name && !(shouldUpdate)
	)
}) as <T extends Record<string, any>>(props: ControllerProps<T>) => JSX.Element
