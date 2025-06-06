/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type JSX, memo, type ReactNode } from 'react';

import { ControllerContext } from '../contexts/ControllerContext';
import { type FormKey } from '../types/FormKey';
import { type FormContextType } from '../types/formTypes';

export type ControllerProps<T extends Record<string, any>> = {
	children: ReactNode
	context: FormContextType<T, any>
	name: FormKey<T>
	deps?: any[]
};

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
export const Controller = memo(function Controller({ name, children }: ControllerProps<Record<string, any>>): JSX.Element {
	return (
		<ControllerContext.Provider
			value={{
				name
			}}
		>
			{ children }
		</ControllerContext.Provider>
	);
}, (
	prevProps, 
	{
		context, name, deps 
	}
) => {
	const isSameDeps = !deps 
		|| (
			prevProps.deps 
			&& deps.length === prevProps.deps.length
			&& deps.every((dep, index) => dep === prevProps.deps![index])
		)!;

	// Determine if any of the changed keys are related to the name prop
	const shouldUpdate = context.changedKeys
	.some((changedKey) => changedKey.includes(name) || name.includes(changedKey));

	const renderKeys = context.onRender.renderKeys;
	renderKeys.set(name, renderKeys.get(name) ?? false);

	return (
		prevProps.name === name && !shouldUpdate && isSameDeps
	);
}) as <T extends Record<string, any>>(props: ControllerProps<T>) => JSX.Element;
