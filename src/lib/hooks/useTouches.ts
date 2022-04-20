import { useRef } from 'react';

import { FormKey } from '../types/FormKey';

export type Touches<T extends object> = {
	[K in FormKey<T>]?: boolean
} 

/**
 * Hook to control form `touches`
 */
export const useTouches = <T extends Record<string, any>> () => {
	const touches = useRef<Touches<T>>({ });
	const isTouched = useRef<boolean>(false);

	isTouched.current = ((): boolean => {
		const values: boolean[] = Object.values(touches.current);
		return Boolean(values.length) && values
		.some((value: boolean): boolean => value)
	})();

	const setTouch = (key: FormKey<T>, value: boolean) => {
		touches.current[key] = touches.current[key] || value;
	} 

	/**
	 * Remove all touch's
	 */
	const resetTouch = () => {
		touches.current = { };
	}

	const triggerManualTouch = <Key extends FormKey<T>>(keys: Key | Key[]) => {
		const _keys = Array.isArray(keys) ? keys : [keys];

		_keys.forEach((key) => {
			// @ts-expect-error
			touches.current[key] = true;
		});
	}

	return [
		{
			isTouched,
			touches: touches.current
		},
		{
			resetTouch,
			triggerManualTouch,
			setTouch
		}
	] as const
}
