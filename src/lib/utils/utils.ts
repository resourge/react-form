import { type FormKey } from '../types';
import { type Touches } from '../types/formTypes';

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
					touch: false 
				});
			}
			else {
				touch.submitted = true;
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
