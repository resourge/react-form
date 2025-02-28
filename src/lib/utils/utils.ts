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
	filterKeysError?: ((key: string) => boolean),
	seen = new WeakSet(), 
	prefix = ''
) {
	if (typeof obj !== 'object' || obj === null || seen.has(obj as WeakKey)) {
		return;
	}
	
	seen.add(obj as WeakKey);
	
	for (const key of Object.keys(obj as WeakKey)) {
		const fullKey = Array.isArray(obj) 
			? `${prefix}[${key}]` 
			: (prefix ? `${prefix}.${key}` : key);
		if (!filterKeysError || filterKeysError(fullKey)) {
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
			setSubmitDeepKeys(obj[key], touches, filterKeysError, seen, fullKey);
		}
	}
}
