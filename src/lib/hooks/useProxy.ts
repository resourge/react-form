import { useRef } from 'react';

import { observeObject } from '../utils/observeObject/observeObject';

export const useProxy = <T extends object>(
	defaultValue: () => T,
	onKeyTouch: (key: string) => void
) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const proxyRef = useRef<T>(undefined!);
	
	if ( !proxyRef.current ) {
		proxyRef.current = observeObject<T>(
			defaultValue(),
			onKeyTouch
		);
	}

	return proxyRef;
};
