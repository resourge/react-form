import { useRef } from 'react';

import { observeObject, type OnKeyTouch } from '../utils/observeObject/observeObject';

export const useProxy = <T extends object>(
	defaultValue: () => T,
	onKeyTouch: OnKeyTouch
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
