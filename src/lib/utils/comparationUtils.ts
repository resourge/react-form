import { type FormErrors } from '../types/formTypes';

export function booleanCompare(a: boolean = false, b: boolean = false) {
	return Boolean(Number(a) - Number(b));
}

export function arrayOfStringCompare(arr1: string[] = [], arr2: string[] = []) {
	if (arr1.length !== arr2.length) {
		return false;
	}

	// Compare each element in the arrays
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	return true;
}

export function deepCompare<T extends Record<string, any>>(
	obj1: FormErrors<T>,
	obj2: FormErrors<T>
) { 
	// Check if both arguments are strictly equal
	if (obj1 === obj2) return true;

	// Get the keys of each object
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	// Check if both objects have the same number of keys
	if (keys1.length !== keys2.length) return false;

	// Check if all keys and values are the same
	for (const key of keys1) {
		if (!keys2.includes(key)) {
			return false;
		}

		if ( !arrayOfStringCompare(obj1[key as keyof FormErrors<T>], obj2[key as keyof FormErrors<T>]) ) {
			return false;
		}
	}
	return true;
}
