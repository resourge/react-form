import { MutableRefObject, useRef } from 'react'

import { FormKey } from '../types'

export type WatchMethod<T extends Record<string, any>> = (form: T) => void | Promise<void>

export type UseWatchReturn<T extends Record<string, any>> = {
	onWatch: MutableRefObject<(form: T, changedKeys: MutableRefObject<Set<FormKey<T>>>) => Promise<void>>
	watch: (key: FormKey<T>, method: WatchMethod<T>) => void
}

/**
 * Hook to watch key `touches` to then do "something" else
 */
export const useWatch = <T extends Record<string, any>>(): UseWatchReturn<T> => {
	const watchedRefs = useRef<Map<FormKey<T>, WatchMethod<T>>>(new Map())

	const watch = (key: FormKey<T>, method: WatchMethod<T>) => {
		watchedRefs.current.set(key, method);
	}

	const onWatch = useRef(async (form: T, changedKeys: React.MutableRefObject<Set<FormKey<T>>>) => {
		for (const [key, method] of watchedRefs.current) {
			if ( changedKeys.current.has(key) ) {
				// eslint-disable-next-line no-await-in-loop
				await Promise.resolve(method(form));
			}
		}
	});

	return {
		watch: watch as unknown as UseWatchReturn<T>['watch'],
		onWatch
	};
}
