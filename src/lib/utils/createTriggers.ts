import { type OnKeyTouchMetadataType } from './getProxy/getProxyTypes';

export type FormTrigger = {
	formTrigger: (key?: string, metadata?: OnKeyTouchMetadataType) => void
	resetFormCores: Map<string, Array<() => void>>
	splitters: Map<string, Array<(key?: string) => void>>
};

export type CreateTriggersResult = {
	removeForm: () => void
	triggerRender: (key?: string, metadata?: OnKeyTouchMetadataType) => void
	triggers: FormTrigger
};

export type CreateTriggersConfig = {
	formKey: string
	isForm: boolean
	keysOnRender: React.MutableRefObject<Set<string>>
	resetFormCore: () => void
	state: [number, React.Dispatch<React.SetStateAction<number>>]
	triggers: FormTrigger
};

export function createTriggers(
	{
		formKey, isForm, keysOnRender,
		resetFormCore, state, triggers
	}: CreateTriggersConfig
): CreateTriggersResult {
	const triggerRender = (key?: string, metadata?: OnKeyTouchMetadataType) => {
		if ( key && metadata?.isArray && !metadata.touch) {
			keysOnRender.current.add(key);
		}
		if ( !key || keysOnRender.current.has(key) ) {
			state[1]((x) => x + 1);
		}
	};

	if ( isForm ) {
		const splitters = new Map<string, Array<(key?: string, metadata?: OnKeyTouchMetadataType) => void>>();
		const resetFormCores = new Map<string, Array<() => void>>();

		const formTrigger = (key?: string, metadata?: OnKeyTouchMetadataType) => {
			if ( key ) {
				if ( resetFormCores.has(key) ) {
					resetFormCores
					.forEach((events, triggerKey) => {
						if ( 
							triggerKey.startsWith(key) 
						) {
							events.forEach((cb) => cb());
						}
					});
				}

				splitters
				.forEach((events, triggerKey) => {
					if ( 
						key.startsWith(triggerKey) 
					) {
						events.forEach((cb) => cb(key, metadata));
					}
				});
			}

			triggerRender(key, metadata);
		};

		return {
			triggers: {
				formTrigger,
				splitters,
				resetFormCores
			},
			triggerRender: formTrigger,
			removeForm: () => {}
		};
	}

	const events = triggers.splitters.get(formKey) ?? [];
	events.push(triggerRender);
	triggers.splitters.set(formKey, events);

	const resetFormCoreEvents = triggers.resetFormCores.get(formKey) ?? [];
	resetFormCoreEvents.push(resetFormCore);
	triggers.resetFormCores.set(formKey, resetFormCoreEvents);

	const removeForm = () => {
		const index = events.indexOf(triggerRender);
		if (index !== -1) {
			events.splice(index, 1);
		};
	};
	
	return {
		triggers,
		triggerRender,
		removeForm
	};
}
