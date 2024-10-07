import { type FormKey } from '../types/FormKey';

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
export const filterObject = <T extends Record<string, any>>(
	obj: T, 
	filterKey?: (filterKey: FormKey<T> | string) => boolean
): T => filterKey
	? Object.fromEntries(
		Object.entries(obj)
		.filter(([key]) => filterKey(key))
	) as T
	: obj;

/**
 * Filter an Object by Key
 */
export const filterObjectByKey = <T extends Record<string, any>>(obj: T, filterKey: FormKey<T>): T => 
	filterObject<T>(obj, (key) => key.includes(filterKey));
