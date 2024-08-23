import { useEffect, useRef } from 'react';

import { type FormKey, type Touches } from '../types';

export type CacheType = string[] | boolean;

export const useTouches = <T extends Record<string, any>>() => {
	const changedKeys = useRef<Set<FormKey<T>>>(new Set());
	const cacheErrors = useRef<Record<string, Map<string, CacheType>>>({});
	const touchesRef = useRef<Touches<T>>({});

	const clearTouches = () => {
		touchesRef.current = {};
		cacheErrors.current = {};
	};
	
	const updateTouches = (key: FormKey<T>) => {
		cacheErrors.current[key] = new Map();
		touchesRef.current[key] = true;
		changedKeys.current.add(key);
	};

	const setCache = <ReturnValue extends CacheType>(
		key: string,
		type: string,
		cb: () => ReturnValue
	): ReturnValue => {
		if ( !cacheErrors.current[key] ) {
			cacheErrors.current[key] = new Map();
		}

		if ( !cacheErrors.current[key].has(type) ) {
			cacheErrors.current[key].set(type, cb());
		}

		return cacheErrors.current[key].get(type) as ReturnValue;
	};

	useEffect(() => {
		changedKeys.current.clear();
	});

	return {
		touchesRef,
		changedKeys: Array.from(changedKeys.current.values()),
		updateTouches,
		setCache,
		clearTouches
	};
};
