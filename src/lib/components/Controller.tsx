import { memo } from 'react';

import { ControllerContext } from '../contexts/ControllerContext';
import { type FormContextObject } from '../contexts/FormContext';
import { type FormKey } from '../types/FormKey';
import { type UseFormReturn } from '../types/formTypes';

export type ControllerProps<T extends Record<string, any>> = {
	children: React.ReactNode
	context: FormContextObject<T>
	name: FormKey<T>
	deps?: any[]
}

export type UseFormReturnController<T extends Record<string, any>> = UseFormReturn<T> & {
	/**
	 * Current changed keys. It is used in the `Controller` component
	 */
	changedKeys: React.MutableRefObject<Set<FormKey<T>>>
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
export const Controller = memo(function Controller({
	name, context, children 
}: ControllerProps<Record<string, any>>): JSX.Element {
	return (
		<ControllerContext.Provider
			value={{
				name,
				context 
			}}
		>
			{ children }
		</ControllerContext.Provider>
	);
}, (prevProps, nextProps) => {
	// This is so "changedKeys" will only be visible
	// with types to the controller 
	const context = nextProps.context as UseFormReturnController<Record<string, any>>;
	const changedKeys = context.changedKeys;
	const keyToFind = nextProps.name;
	const keys = [...changedKeys.current.keys()];

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const isSameDeps = !nextProps.deps || (nextProps.deps && nextProps.deps.length === 0) || Boolean(nextProps.deps && prevProps.deps && nextProps.deps.some((dep, index) => dep === prevProps.deps![index]));

	const shouldUpdate = keys.some((key) => (
		key.includes(keyToFind) 
		|| keyToFind.includes(key)
	));

	return (
		prevProps.name === nextProps.name && !(shouldUpdate) && isSameDeps
	);
}) as <T extends Record<string, any>>(props: ControllerProps<T>) => JSX.Element;
