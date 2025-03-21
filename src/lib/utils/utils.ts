import { type FormKey } from '../types';
import { type Touches } from '../types/formTypes';
import { type FormTrigger } from '../types/types';

export function isObjectOrArray(value: any): value is object {
	return value !== null && typeof value === 'object';
}

/**
 * Determines if a variable is a class definition instead of a function.
 */
export function isClass(x: any): x is new (...args: any[]) => any {
	return typeof x === 'function' 
		&& Object.getOwnPropertyDescriptor(x, 'prototype')?.writable === false;
}

export function setSubmitDeepKeys(
	obj: any, 
	touches: Touches,
	resolveKey: (key: string) => FormKey<any>, 
	shouldIncludeError?: ((key: string) => boolean),
	seen = new WeakSet(), 
	prefix = ''
) {
	if (!isObjectOrArray(obj) || seen.has(obj as WeakKey)) {
		return;
	}
	
	seen.add(obj as WeakKey);

	for (const key of Object.keys(obj as WeakKey)) {
		const fullKey = resolveKey(
			Array.isArray(obj) 
				? `${prefix}[${key}]` 
				: (prefix ? `${prefix}.${key}` : key)
		);
		if (!shouldIncludeError || shouldIncludeError(fullKey)) {
			const touch = touches.get(fullKey);
			if ( !touch ) {
				touches.set(fullKey, {
					submitted: true,
					touch: true 
				});
			}
			else {
				touch.submitted = true;
				touch.touch = true;
			}
			setSubmitDeepKeys((obj as Record<string, unknown>)[key], touches, resolveKey, shouldIncludeError, seen, fullKey);
		}
	}
}

export function mergeKeys(baseKey: string = '', key: string) {
	return `${baseKey}${key ? (key.startsWith('[') ? key : `${baseKey ? '.' : ''}${key}`) : ''}`;
} 

export const forEachPossibleKey = (key: string, onKey: (key: string) => void) => {
	(
		key.match(/(?:\.\w+|\[\d+\]|\w+)/g) ?? []
	).forEach((_, index, arr) => onKey(arr.slice(0, arr.length - index).join('')));

	onKey('');
};

export function createTriggers(
	isForm: boolean,
	formKey: string,
	keysOnRender: React.MutableRefObject<Set<string>>,
	state: [number, React.Dispatch<React.SetStateAction<number>>],
	triggers: FormTrigger
): {
		removeForm: () => void
		triggerRender: (key?: string) => void
		triggers: FormTrigger
	} {
	const triggerRender = (key?: string) => {
		if ( !key || keysOnRender.current.has(key) ) {
			state[1]((x) => x + 1);
		}
	};

	if ( isForm ) {
		const splitters = new Map<string, Array<(key?: string) => void>>();

		const formTrigger = (key?: string) => {
			if ( key ) {
				splitters
				.forEach((events, triggerKey) => {
					if ( 
						key !== triggerKey 
						&& key.startsWith(triggerKey) 
					) {
						events.forEach((cb) => cb(key));
					}
				});
			}

			triggerRender(key);
		};

		return {
			triggers: {
				formTrigger,
				splitters
			},
			triggerRender: formTrigger,
			removeForm: () => {}
		};
	}

	const events = triggers.splitters.get(formKey) ?? [];
	events.push(triggerRender);
	triggers.splitters.set(formKey, events);

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
