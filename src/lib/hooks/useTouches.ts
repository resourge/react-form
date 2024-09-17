import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';

export const useTouches = <T extends Record<string, any>>() => {
	const changedKeys = useRef<Set<FormKey<T>>>(new Set());
	const touchesRef = useRef<Record<string, object>>({});

	const clearTouches = () => {
		touchesRef.current = {};
	};
	
	const updateTouches = (key: FormKey<T>) => {
		touchesRef.current[key] = {};
		changedKeys.current.add(key);
	};
	
	useEffect(() => {
		changedKeys.current.clear();
	});

	return {
		touchesRef,
		changedKeys: Array.from(changedKeys.current),
		updateTouches,
		clearTouches
	};
};
