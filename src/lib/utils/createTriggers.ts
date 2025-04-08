import { type Dispatch, type SetStateAction } from 'react';

import { type OnKeyTouchMetadataType } from './getProxy/getProxyTypes';

export type FormTrigger = Map<string, Array<(key: string) => void>>;

export type CreateTriggersConfig = {
	formKey: string
	isForm: boolean
	keysOnRender: Set<string>
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
		formKey, isForm, keysOnRender, state, 
		triggers = new Map<string, Array<(key?: string, metadata?: OnKeyTouchMetadataType) => void>>()
	}: CreateTriggersConfig
): CreateTriggersResult {
	function check(key: string) {
		for (const keyRender of keysOnRender) {
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
		triggers.set(formKey, []);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const events = triggers.get(formKey)!;
	events.push(triggerRender);

	const removeForm = isForm
		? () => {}
		: () => {
			const events = triggers.get(formKey);
			if ( events ) {
				const index = events.indexOf(triggerRender);
				if (index !== -1) {
					events.splice(index, 1);
				};

				if ( events.length === 0 ) {
					triggers.delete(formKey);
				}
			}
		};
	
	return {
		triggers,
		triggerRender: (key: string) => {
			triggers
			.forEach((trigger, triggerKey) => {
				if ( 
					key.startsWith(triggerKey) 
				) {
					trigger.forEach((cb) => cb(key));
				}
			});
		},
		removeForm
	};
}
