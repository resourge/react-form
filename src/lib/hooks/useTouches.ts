/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useRef } from 'react';

import { FormKey } from '../types/FormKey';

type CurrentTouches<T extends Record<string, any>> = Array<FormKey<T>> & {
	[K in FormKey<T>]?: boolean
}

export type Touches<T extends Record<string, any>> = {
	/**
	 * Paths for the keys touched
	 */
	[K in FormKey<T>]?: boolean
} & { 
	/**
	 * All the changes made to the form before render
	 */
	currentTouches: CurrentTouches<T> 
};

const getDefaultCurrentTouches = <T extends Record<string, any>>(): CurrentTouches<T> => {
	const currentTouches: Array<FormKey<T>> = []

	return currentTouches as CurrentTouches<T>
}

/**
 * Hook to control form `touches`
 */
export const useTouches = <T extends Record<string, any>> () => {
	const touchesRef = useRef<Touches<T>>({
		currentTouches: getDefaultCurrentTouches()
	} as Touches<T>);
	const isTouched = useRef<boolean>(false);

	isTouched.current = ((): boolean => {
		const { currentTouches, ...rest } = touchesRef.current
		const values: boolean[] = Object.values(rest);
		return Boolean(values.length) && values
		.some((value: boolean): boolean => value)
	})();

	const setTouch = (key: FormKey<T>, value: boolean) => {
		touchesRef.current[key as keyof Touches<T>] = ((touchesRef.current[key as keyof Touches<T>] ?? false) || value) as any;

		if ( !touchesRef.current.currentTouches[key as any] ) {
			touchesRef.current.currentTouches.push(key);

			touchesRef.current.currentTouches[key as any] = true as any;
		}
	} 

	/**
	 * Remove all current touches
	 */
	const clearCurrentTouches = () => {
		touchesRef.current.currentTouches = [] as any;
	}

	/**
	 * Remove all touch's
	 */
	const resetTouch = () => {
		touchesRef.current = { 
			currentTouches: touchesRef.current.currentTouches
		} as Touches<T>;
	}

	const triggerManualTouch = <Key extends FormKey<T>>(keys: Key | Key[]) => {
		const _keys = Array.isArray(keys) ? keys : [keys];

		_keys.forEach((key) => {
			// @ts-expect-error
			touchesRef.current[key] = true;
		});
	}

	return [
		{
			isTouched,
			touches: touchesRef
		},
		{
			resetTouch,
			triggerManualTouch,
			setTouch,
			clearCurrentTouches
		}
	] as const
}
