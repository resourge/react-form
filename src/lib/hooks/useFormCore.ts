import { useEffect, useRef, useState } from 'react';

import { type FormTypes } from '../types/formTypes';
import { createFormCore, type FormCoreConfig } from '../utils/createFormCore';

import { useIsRendering } from './useIsRendering';

export const useFormCore = <
	T extends Record<string, any>, 
	FT extends FormTypes = 'form'
>(config: FormCoreConfig<T, FT>) => {
	const state = useState(0);

	const isRenderingRef = useIsRendering();
	const keysOnRender = useRef(new Set<string>());
	// For if cases were keys stop being "used"
	keysOnRender.current.clear();

	const [
		[
			proxy, 
			verifyErrors,
			removeForm
		]
	] = useState(() => 
		createFormCore<T, FT>({
			config, 
			isRenderingRef,
			state,
			keysOnRender
		})
	);

	useEffect(() => () => removeForm(), []);

	verifyErrors();

	return proxy;
};
