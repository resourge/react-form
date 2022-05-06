import { useRef } from 'react';

import { FormErrors } from '../types/types';

export type CacheType = string[] | FormErrors<any> | boolean

export type UseCacheErrors = {
	setCacheErrors: <ReturnValue extends CacheType>(key: string, cb: () => ReturnValue) => ReturnValue
	clearCacheErrors: () => void
}

/**
 * Caches the errors by the deps
 * @returns {@link UseCacheErrors}
 */
export const useCacheErrors = (): UseCacheErrors => {
	const cacheErrors = useRef<{ [key: string]: CacheType }>({});

	const setCacheErrors = <ReturnValue extends CacheType>(key: string, cb: () => ReturnValue): ReturnValue => {
		if ( !cacheErrors.current[key] ) {
			cacheErrors.current[key] = cb();
		}

		return cacheErrors.current[key] as ReturnValue
	}

	const clearCacheErrors = () => {
		cacheErrors.current = {}
	}

	return {
		setCacheErrors,
		clearCacheErrors
	};
}
