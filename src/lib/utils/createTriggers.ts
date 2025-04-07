import { type Dispatch, type MutableRefObject, type SetStateAction } from 'react';

import { type OnKeyTouchMetadataType } from './getProxy/getProxyTypes';

export type FormTrigger = Map<string, {
	resetFormCores: Array<() => void>
	splitter: Array<(key: string) => void>
}>;

export type CreateTriggersConfig = {
	formKey: string
	isForm: boolean
	keysOnRender: MutableRefObject<Set<string>>
	resetFormCore: () => void
	state: [number, Dispatch<SetStateAction<number>>]
	triggers: FormTrigger
};

export type CreateTriggersResult = {
	removeForm: () => void
	triggerRender: (key: string) => void
	triggers?: FormTrigger
};

export function createTriggers(
	{
		formKey, isForm, keysOnRender,
		resetFormCore, state, 
		triggers = new Map<string, {
			resetFormCores: Array<() => void>
			splitter: Array<(key?: string, metadata?: OnKeyTouchMetadataType) => void>
		}>()
	}: CreateTriggersConfig
): CreateTriggersResult {
	function check(key: string) {
		for (const keyRender of keysOnRender.current) {
			if ( keyRender === key || key.startsWith(keyRender) ) {
				return true;
			}
		}
		return false;
	}

	const triggerRender = (key: string) => {
		if ( !key || key === formKey || check(key) ) {
			state[1]((x) => x + 1);
		}
	};

	if ( !triggers.has(formKey) ) {
		triggers.set(formKey, {
			splitter: [],
			resetFormCores: [] 
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const events = triggers.get(formKey)!;
	events.splitter.push(triggerRender);
	if ( !isForm ) {
		events.resetFormCores.push(resetFormCore);
	}

	const removeForm = isForm
		? () => {}
		: () => {
			const events = triggers.get(formKey);
			if ( events ) {
				const index = events.splitter.indexOf(triggerRender);
				if (index !== -1) {
					events.splitter.splice(index, 1);
				};
				
				const resetIndex = events.resetFormCores.indexOf(resetFormCore);
				if (resetIndex !== -1) {
					events.resetFormCores.splice(resetIndex, 1);
				};

				if ( events.splitter.length === 0 && events.resetFormCores.length === 0 ) {
					triggers.delete(formKey);
				}
			}
		};
	
	return {
		triggers,
		triggerRender: (key: string) => {
			triggers
			.forEach(({ splitter, resetFormCores }, triggerKey) => {
				if ( 
					triggerKey.startsWith(key) 
				) {
					resetFormCores.forEach((cb) => cb());
				}
				
				if ( 
					key.startsWith(triggerKey) 
				) {
					splitter.forEach((cb) => cb(key));
				}
			});
		},
		removeForm
	};
}
