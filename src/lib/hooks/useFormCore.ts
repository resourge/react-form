import { useRef, useState } from 'react';

import { type FormTypes } from '../types/formTypes';
import { createFormCore, type FormCoreConfig } from '../utils/createFormCore';

import { useIsRendering } from './useIsRendering';

export const useFormCore = <
	T extends Record<string, any>, 
	FT extends FormTypes = 'form'
>(config: FormCoreConfig<T, FT>) => {
	const state = useState(0);

	const isRenderingRef = useIsRendering();

	const formRef = useRef<{ 
		config: FormCoreConfig<T, FT>
		core: ReturnType<typeof createFormCore<T, FT>>
	}>({
		core: undefined as unknown as ReturnType<typeof createFormCore<T, FT>>,
		config
	});

	if ( 
		!formRef.current.core
		|| formRef.current.config.formFieldKey !== config.formFieldKey
		|| formRef.current.config.value !== config.value
	) {
		formRef.current = {
			core: createFormCore<T, FT>({
				config, 
				isRenderingRef,
				state
			}),
			config
		};
	}

	return formRef.current.core();
};
