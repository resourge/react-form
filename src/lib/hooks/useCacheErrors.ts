import { useEffect, useRef } from 'react';

import { FormErrors } from '../types/types';

export type CacheType = string[] | FormErrors<any> | boolean

export type UseCacheErrors = {
	setCacheErrors: <ReturnValue extends CacheType>(key: string, cb: () => ReturnValue) => ReturnValue
	clearCacheErrors: () => void
}

/**
 * Caches the errors by the deps
 * 
 * @param defaultErrors - default errors
 * @param deps - if present, cache will clear if the values in the list change.
 * @returns 
 */
    
export const useCacheErrors = (
	defaultErrors: { [key: string]: string[] | FormErrors<any> } = {},
	deps?: React.DependencyList
): UseCacheErrors => {
	const cacheErrors = useRef<{ [key: string]: CacheType }>(defaultErrors);

	const setCacheErrors = <ReturnValue extends CacheType>(key: string, cb: () => ReturnValue): ReturnValue => {
		if ( !cacheErrors.current[key] ) {
			cacheErrors.current[key] = cb();
		}

		return cacheErrors.current[key] as ReturnValue
	}

	const clearCacheErrors = () => {
		cacheErrors.current = {}
	}

	useEffect(() => {
		clearCacheErrors()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return {
		setCacheErrors,
		clearCacheErrors
	};
}
