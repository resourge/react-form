import { type TouchesResult } from '../hooks/useTouches';
import { type OnKeyTouchMetadataType } from '../utils/getProxy/getProxyTypes';

import { type FormStateRef, type FormOptions } from './formTypes';

export type FormTrigger = {
	formTrigger: (key?: string, metadata?: OnKeyTouchMetadataType) => void
	splitters: Map<string, Array<(key?: string) => void>>
};

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
