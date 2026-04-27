import { type FormKey } from '../types';
import { type Touches } from '../types/formTypes';

type SubmitDeepKeysType = {
	obj: any
	prefix?: string
	resolveKey: (key: string) => FormKey<any>
	seen?: WeakSet<WeakKey>
	shouldIncludeError?: ((key: string) => boolean)
	touches: Touches
};

/**
 * Determines if a variable is a class definition instead of a function.
 */
export function isClass(x: any): x is new (...args: any[]) => any {
	return typeof x === 'function'
		&& Object.getOwnPropertyDescriptor(x, 'prototype')?.writable === false;
}

export function isObjectOrArray(value: any): value is object {
	return value !== null && typeof value === 'object';
}

export function mergeKeys(baseKey: string = '', key: string) {
	return `${baseKey}${key
		? (key.startsWith('[')
			? key
			: `${baseKey
				? '.'
				: ''}${key}`)
		: ''}`;
}

export function setSubmitDeepKeys({
	obj,
	prefix = '',
	resolveKey,
	seen = new WeakSet(),
	shouldIncludeError,
	touches
}: SubmitDeepKeysType) {
	if (!isObjectOrArray(obj) || seen.has(obj)) {
		return;
	}

	seen.add(obj);

	for (const key of Object.keys(obj)) {
		const fullKey = resolveKey(
			Array.isArray(obj)
				? `${prefix}[${key}]`
				: (prefix
					? `${prefix}.${key}`
					: key)
		);
		if (!shouldIncludeError || shouldIncludeError(fullKey)) {
			const touch = touches.get(fullKey);
			if (touch) {
				touch.submitted = true;
			}
			else {
				touches.set(fullKey, {
					errorWasShown: false,
					submitted: true,
					touch: false
				});
			}
			setSubmitDeepKeys({
				obj: (obj as Record<string, unknown>)[key], 
				prefix: fullKey,
				resolveKey,
				seen,
				shouldIncludeError,
				touches
			});
		}
	}
}

export const forEachPossibleKey = (key: string, onKey: (key: string) => void) => {
	(
		key.match(/(?:\.\w+|\[\d+\]|\w+)/g) ?? []
	).forEach((_, index, arr) => onKey(arr.slice(0, arr.length - index).join('')));

	onKey('');
};
