import { type FormKey } from '../types/FormKey';

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

/**
 * Filter an Object by Key
 */
export const checkIfKeysExist = <T extends Record<string, any>>(obj: T, filterKey: FormKey<T>): Boolean => 
	Boolean(
		Object.keys(obj)
		.filter((key) => key.includes(filterKey))
		.length
	);

/**
 * Filter an Object by Key and also map it
 */
export const filterObjectByKeyAndMap = <T extends Record<string, any>>(
	obj: T, 
	filterKey: FormKey<T>
): T => filterKey
	? Object.fromEntries(
		Object.entries(obj)
		.filter(([key]) => key.includes(filterKey))
		.map(([key, error]) => [
			key
			.replace(filterKey, '')
			.replace(/^\./, ''), 
			error
		])
	) as T
	: obj;
