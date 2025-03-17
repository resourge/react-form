import { type MutableRefObject } from 'react';

import { type TouchesResult } from '../hooks/useTouches';

import { type FormErrors, type FormOptions } from './formTypes';

export type FormTrigger = {
	formTrigger: (key?: string) => void
	splitters: Map<string, Array<(key?: string) => void>>
};

export type FormCoreOptions<T extends Record<string, any>> = {
	errorRef: MutableRefObject<FormErrors<T>>
	formOptions: FormOptions<T>
	touchHook: TouchesResult<T>
	baseKey?: string
	triggers?: FormTrigger
};

export type DebounceOptions = { 
	timeout: NodeJS.Timeout
	value: any 
};
