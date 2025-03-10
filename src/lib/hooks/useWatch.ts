import { type MutableRefObject, useRef } from 'react';

import { type FormKey } from '../types';
import { type WatchMethod } from '../types/formTypes';

export type UseWatchReturn<T extends Record<string, any>> = {
	onSubmitWatch: (form: T) => Promise<void>
	watch: (key: FormKey<T> | 'submit', method: WatchMethod<T>) => void
	watchedRefs: MutableRefObject<Map<FormKey<T>, WatchMethod<T>>>
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

	const onSubmitWatch = async (form: T) => {
		await Promise.all(
			Array.from(submitWatchRefs.current)
			.map((method) => method(form))
		);
	};

	return {
		watch,
		onSubmitWatch,
		watchedRefs
	};
};
