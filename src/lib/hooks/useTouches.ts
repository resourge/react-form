import { useEffect, useRef } from 'react';

import { type FormKey } from '../types';

export const useTouches = <T extends Record<string, any>>() => {
	const changedKeysRef = useRef<Set<FormKey<T>>>(new Set());
	const touchesRef = useRef<Record<string, object>>({});

	const clearTouches = () => {
		touchesRef.current = {};
	};
	
	const updateTouches = (key: FormKey<T>) => {
		touchesRef.current[key] = {};
		changedKeysRef.current.add(key);
	};
	
	useEffect(() => {
		changedKeysRef.current.clear();
	});

	return {
		touchesRef,
		changedKeysRef,
		updateTouches,
		clearTouches
	};
};
