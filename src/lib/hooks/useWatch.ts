import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types';

export type WatchMethod<T extends Record<string, any>> = (form: T) => void | Promise<void>;

export type UseWatchReturn<T extends Record<string, any>> = {
	hasWatchingKeys: (changedKeys: MutableRefObject<Set<FormKey<T>>>) => boolean
	onSubmitWatch: MutableRefObject<() => (form: T) => Promise<void>>
	onWatch: MutableRefObject<(form: T, changedKeys: MutableRefObject<Set<FormKey<T>>>) => Promise<void>>
	watch: (key: FormKey<T>, method: WatchMethod<T>) => void
};

/**
 * Hook to watch key `touches` to then do "something" else
 */
export const useWatch = <T extends Record<string, any>>(): UseWatchReturn<T> => {
	const watchedRefs = useRef<Map<FormKey<T>, WatchMethod<T>>>(new Map());
	const submitWatchRefs = useRef<Set<WatchMethod<T>>>(new Set());
	
	submitWatchRefs.current.clear();

	const watch = (key: FormKey<T> | 'submit', method: WatchMethod<T>) => {
		if ( key !== 'submit' ) {
			watchedRefs.current.set(key, method);
		}
		else {
			submitWatchRefs.current.add(method);
		}
	};

	const hasWatchingKeys = (changedKeys: React.MutableRefObject<Set<FormKey<T>>>) => {
		return watchedRefs.current.size > 0 && Array.from(watchedRefs.current)
		.some(([key]) => changedKeys.current.has(key));
	};

	const onWatch = useRef(async (form: T, changedKeys: React.MutableRefObject<Set<FormKey<T>>>) => {
		for (const [key, method] of watchedRefs.current) {
			if ( changedKeys.current.has(key) ) {
				// eslint-disable-next-line no-await-in-loop
				await Promise.resolve(method(form));
			}
		}
	});

	const onSubmitWatch = useRef(() => {
		const submitMethods = Array.from(submitWatchRefs.current.values());

		return async (form: T) => {
			await Promise.all(
				submitMethods
				.map((method) => Promise.resolve(method(form)))
			);
		};
	});

	return {
		watch: watch as unknown as UseWatchReturn<T>['watch'],
		hasWatchingKeys,
		onWatch,
		onSubmitWatch
	};
};
