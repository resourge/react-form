import type { Dispatch, SetStateAction } from 'react';

import type { OnRenderType } from '../types/types';

import type { OnKeyTouchMetadataType } from './getProxy/getProxyTypes';

export type FormTrigger = Map<string, Array<(key: string) => void>>;

export type CreateTriggersConfig = {
	formKey: string
	isForm: boolean
	onRender: OnRenderType
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
		formKey, isForm, onRender, state, 
		triggers = new Map<string, Array<(key?: string, metadata?: OnKeyTouchMetadataType) => void>>()
	}: CreateTriggersConfig
): CreateTriggersResult {
	function check(key: string) {
		for (const [keyRender, includeChildren] of onRender.renderKeys) {
			// Check to see if key is observed
			// For keys observed that includeChildren (error with includeChildsIntoArray) too
			if ( includeChildren ? key.startsWith(keyRender) : keyRender.startsWith(key) ) {
				return true;
			}
		}
		return false;
	}

	const triggerRender = (key: string) => {
		if ( !onRender.isRendering && (!key || check(key)) ) {
			onRender.isRendering = true;
			state[1]((x) => x + 1);
		}
	};

	if ( !triggers.has(formKey) ) {
		triggers.set(formKey, []);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const events = triggers.get(formKey)!;
	events.push(triggerRender);

	const removeForm = () => {
		const index = events.indexOf(triggerRender);
		if (index !== -1) {
			events.splice(index, 1);
		};

		if ( events.length === 0 ) {
			triggers.delete(formKey);
		}
	};
	
	return {
		triggers,
		triggerRender: (key: string) => {
			triggers
			.forEach((trigger) => {
				trigger.forEach((cb) => cb(key));
			});
		},
		removeForm
	};
}
