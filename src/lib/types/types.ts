import { type MutableRefObject } from 'react';

import { type TouchesResult } from '../hooks/useTouches';
import { type OnKeyTouch } from '../utils/observeObject/observeObject';

import { type FormErrors, type FormOptions } from './formTypes';

export type FormCoreOptions<T extends Record<string, any>> = {
	errorRef: MutableRefObject<FormErrors<T>>
	formOptions: FormOptions<T>
	touchHook: TouchesResult<T>
	baseKey?: string
	onKeyTouch?: OnKeyTouch
};

export type DebounceOptions = { 
	timeout: NodeJS.Timeout
	value: any 
};
