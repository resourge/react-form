import { useEffect, useRef } from 'react';

import { FormKey, Touches } from '../types';

export const useChangedKeys = <T extends Record<string, any>>(touches: Touches<T>) => {
	const changedKeys = useRef<Set<FormKey<T>>>(new Set());
	const updateController = (key: FormKey<T>) => {
		changedKeys.current.add(key)
	}

	useEffect(() => {
		changedKeys.current.clear();
	}, [touches]);

	return [changedKeys, updateController] as const
}
