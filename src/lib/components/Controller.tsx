import { type JSX, memo, type ReactNode, useMemo } from 'react';

import { ControllerContext } from '../contexts/ControllerContext';
import { type FormKey } from '../types/FormKey';
import { type FormContextType } from '../types/formTypes';

export type ControllerProps<T extends Record<string, any>> = {
	children: ReactNode
	context: FormContextType<T, any>
	deps?: any[]
	name: FormKey<T>
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
const Controller = memo(function Controller({ children, name }: ControllerProps<Record<string, any>>): JSX.Element {
	return (
		<ControllerContext.Provider
			value={
				useMemo(() => ({
					name 
				}), [name])
			}
		>
			{ children }
		</ControllerContext.Provider>
	);
}, (
	prevProps, 
	{
		context, deps, name 
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

export default Controller;
