import { type FormKey } from '../types/FormKey';

/**
 * determines if a variable is a class definition instead of a function
 */
export function isClass(x: any) {
	if ( typeof x === 'function' ) {
		const prototype = Object.getOwnPropertyDescriptor(x, 'prototype');

		if ( prototype ) { 
			return !prototype.writable;
		}
	}

	return false;
}

/**
 * Filter an Object by Key
 */
export const filterObject = <T extends Record<string, any>>(
	obj: T, 
	filterKey?: (filterKey: FormKey<T>) => boolean
): T => filterKey
	? Object.fromEntries(
		Object.entries(obj)
		.filter(([key]) => filterKey(key as FormKey<T>))
	) as T
	: obj;

/**
 * Filter an Object by Key
 */
export const filterObjectByKey = <T extends Record<string, any>>(obj: T, filterKey: FormKey<T>): T => 
	filterObject<T>(obj, (key) => key.includes(filterKey));
