import { type TouchesResult } from '../hooks/useTouches';
import { type FormTrigger } from '../utils/createTriggers';
import { type FormOptions, type FormStateRef } from './formTypes';

export type DebounceOptions = { 
	timeout: NodeJS.Timeout
	value: any 
};

export type FormCoreOptions<T extends Record<string, any>> = {
	contextKey?: string
	formOptions: FormOptions<T>
	stateRef?: FormStateRef<T>
	touchHook: TouchesResult<T>
	triggers?: FormTrigger
};

export type OnRenderType = {
	isRendering: boolean
	renderKeys: Map<string, boolean>
};
