import { useMemo, useRef } from 'react';

import { FormErrors } from '../types';
import { createErrorProxy } from '../utils/createErrorProxy';

export const useProxyError = <T>(
	errors: FormErrors<T>,
	baseKey: string = ''
) => {
	const errorsRef = useRef(errors)

	errorsRef.current = errors;

	return useMemo(() => {
		return createErrorProxy<T>(errorsRef, baseKey)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
}
