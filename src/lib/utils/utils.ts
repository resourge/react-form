import { type FormErrors, type Touches } from '../types';
import { type FormKey } from '../types/FormKey';

function isNumeric(value: string | number) {
	if ( typeof value === 'number' ) {
		return true;
	}
	return /^[-]?([1-9]\d*|0)(\.\d+)?$/.test(value);
}

export const getKeyFromPaths = <T extends Record<string, any>>(paths: string[]): FormKey<T> => {
	return paths
	.map((key) => `${isNumeric(key) ? `[${key}]` : `${key}`}`)
	.join('.')
	.replace(/\.\[/g, '[') as FormKey<T>;
};

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
export const filterObject = <T extends Record<string, any>>(obj: T, filterKey: (filterKey: FormKey<T>) => boolean): T => Object.fromEntries(
	Object.entries(obj)
	.filter(([key]) => filterKey(key as FormKey<T>))
) as T;

/**
 * Filter an Object by Key
 */
export const filterObjectByKey = <T extends Record<string, any>>(obj: T, filterKey: FormKey<T>): T => Object.fromEntries(
	Object.entries(obj)
	.filter(([key]) => key.includes(filterKey))
) as T;

export function filterKeys<T extends Record<string, any>>(
	newErrors: FormErrors<T>,
	touches: Touches<T>,
	filterKeysError?: (key: string) => boolean
) {
	return filterKeysError ? Object.entries(newErrors)
	.reduce<FormErrors<T>>((errors, [key, value]) => {
		if ( touches[key as FormKey<T>] || filterKeysError(key) ) {
			errors[key as FormKey<T>] = value as string[];
		}
		return errors;
	}, {}) : newErrors;
}
