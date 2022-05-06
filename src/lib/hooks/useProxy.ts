import { useRef } from 'react';

import { FormState, FormErrors, Touches } from '../types/types';
import { createProxy, ProxyData } from '../utils/createProxy';

export const useProxy = <T extends Record<string, any>>(
	errors: FormErrors<T>,
	touches: Touches<T>,
	baseKey: string = ''
) => {
	const formStateRef = useRef<ProxyData<T>>({
		errors,
		touches
	})

	formStateRef.current = {
		errors,
		touches
	};

	const proxyRef = useRef<FormState<T>>()

	if ( !proxyRef.current ) {
		proxyRef.current = createProxy<T>(formStateRef, baseKey)
	}

	return proxyRef.current
}
