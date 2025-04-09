import { type TouchesResult } from '../hooks/useTouches';
import { type FormTrigger } from '../utils/createTriggers';

import { type FormOptions, type FormStateRef } from './formTypes';

export type FormCoreOptions<T extends Record<string, any>> = {
	formOptions: FormOptions<T>
	touchHook: TouchesResult<T>
	contextKey?: string
	stateRef?: FormStateRef<T>
	triggers?: FormTrigger
};

export type DebounceOptions = { 
	timeout: NodeJS.Timeout
	value: any 
};

export type OnRenderType = {
	isRendering: boolean
	renderKeys: Set<string>
};
