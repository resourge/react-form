import { useEffect, useRef } from 'react';

import { type Touches, type FormKey } from '../types';

export const useTouches = <T extends Record<string, any>>() => {
	const changedKeys = useRef<Set<FormKey<T>>>(new Set());
	const touchesRef = useRef<Touches<T>>({});
	
	const updateTouches = (key: FormKey<T>, value: boolean = true) => {
		touchesRef.current[key] = value;
		changedKeys.current.add(key);
	};

	useEffect(() => {
		changedKeys.current.clear();
	}, [touchesRef.current]);

	return {
		touchesRef,
		changedKeys: Array.from(changedKeys.current.values()),
		updateTouches
	};
};
